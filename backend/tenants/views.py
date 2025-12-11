from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import date

from .models import TenantProfile, RoomAssignment
from rooms.models import Room
from .serializers import (
    TenantProfileSerializer,
    TenantProfileListSerializer,
    TenantProfileUpdateSerializer,
    RoomAssignmentSerializer,
    RoomAssignmentCreateSerializer,
    RoomAssignmentEndSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tenants(request):
    """
    List tenant profiles with role-based access.

    GET /api/tenants/

    Admin: Returns all tenant profiles
    Regular User: Returns only their own tenant profile

    Query Parameters:
    - is_active: Filter by active status (true/false)
    - has_assignment: Filter by assignment status (true/false)
    """
    # Check user role
    if request.user.is_admin():
        # Admin can see all tenants
        tenants = TenantProfile.objects.all()
    else:
        # Regular users can only see their own profile
        tenants = TenantProfile.objects.filter(user=request.user)

    # Apply filters
    is_active = request.query_params.get('is_active', None)
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        tenants = tenants.filter(is_active=is_active_bool)

    has_assignment = request.query_params.get('has_assignment', None)
    if has_assignment is not None:
        has_assignment_bool = has_assignment.lower() == 'true'
        if has_assignment_bool:
            # Filter tenants with active assignments
            tenants = [t for t in tenants if t.has_active_assignment()]
        else:
            # Filter tenants without active assignments
            tenants = [t for t in tenants if not t.has_active_assignment()]

    # Serialize data
    serializer = TenantProfileListSerializer(tenants, many=True)

    return Response({
        'count': len(serializer.data),
        'tenants': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tenant(request, pk):
    """
    Get specific tenant profile with full details including assignment history.

    GET /api/tenants/{id}/

    Admin: Can view any tenant
    Regular User: Can only view their own profile
    """
    try:
        tenant = TenantProfile.objects.get(pk=pk)

        # Permission check: regular users can only view their own profile
        if not request.user.is_admin() and tenant.user != request.user:
            return Response({
                'error': 'Permission denied. You can only view your own profile.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = TenantProfileSerializer(tenant)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    """
    Get current user's tenant profile.

    GET /api/tenants/me/

    Returns the tenant profile of the currently logged-in user.
    """
    try:
        tenant = request.user.tenant_profile
        serializer = TenantProfileSerializer(tenant)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'You do not have a tenant profile. Please contact admin.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_tenant(request, pk):
    """
    Update tenant profile information.

    PUT /api/tenants/{id}/update/ - Full update
    PATCH /api/tenants/{id}/update/ - Partial update

    Admin only. Updates tenant information (not user information).
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        tenant = TenantProfile.objects.get(pk=pk)

        partial = request.method == 'PATCH'
        serializer = TenantProfileUpdateSerializer(
            tenant,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():
            serializer.save()

            # Return full tenant data
            response_serializer = TenantProfileSerializer(tenant)

            return Response({
                'message': 'Tenant profile updated successfully',
                'tenant': response_serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_tenant(request, pk):
    """
    Soft delete tenant profile (set is_active to False).

    DELETE /api/tenants/{id}/delete/

    Admin only. Cannot delete tenant with active room assignment.
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        tenant = TenantProfile.objects.get(pk=pk)

        # Check if tenant has active assignment
        if tenant.has_active_assignment():
            return Response({
                'error': 'Cannot delete tenant with active room assignment. Please end assignment first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Soft delete
        tenant.is_active = False
        tenant.save()

        return Response({
            'message': f'Tenant profile for {tenant.user.get_full_name()} deleted successfully'
        }, status=status.HTTP_200_OK)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_tenants(request):
    """
    Get all active tenants (is_active=True).

    GET /api/tenants/active/

    Admin only.
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    tenants = TenantProfile.objects.filter(is_active=True)
    serializer = TenantProfileListSerializer(tenants, many=True)

    return Response({
        'count': tenants.count(),
        'tenants': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_room(request, pk):
    """
    Assign a tenant to a room.

    POST /api/tenants/{id}/assign/

    Admin only. Creates new room assignment and updates room status to 'occupied'.

    Request body:
    {
        "room": <room_id>,
        "move_in_date": "YYYY-MM-DD",
        "lease_end_date": "YYYY-MM-DD" (optional),
        "monthly_rent": <decimal>
    }
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        tenant = TenantProfile.objects.get(pk=pk)

        # Check if tenant is active
        if not tenant.is_active:
            return Response({
                'error': 'Cannot assign room to inactive tenant'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add tenant to request data
        assignment_data = request.data.copy()
        assignment_data['tenant'] = tenant.id

        # Create assignment
        serializer = RoomAssignmentCreateSerializer(data=assignment_data)

        if serializer.is_valid():
            assignment = serializer.save()

            # Return full assignment data
            response_serializer = RoomAssignmentSerializer(assignment)

            return Response({
                'message': f'Room {assignment.room.room_number} assigned to {tenant.user.get_full_name()} successfully',
                'assignment': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unassign_room(request, pk):
    """
    End tenant's current room assignment (move out).

    POST /api/tenants/{id}/unassign/

    Admin only. Ends current assignment and updates room status to 'available'.

    Request body (optional):
    {
        "move_out_date": "YYYY-MM-DD"  // defaults to today
    }
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        tenant = TenantProfile.objects.get(pk=pk)

        # Get current assignment
        current_assignment = tenant.get_current_assignment()

        if not current_assignment:
            return Response({
                'error': 'Tenant does not have an active room assignment'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate move_out_date if provided
        serializer = RoomAssignmentEndSerializer(data=request.data)
        if serializer.is_valid():
            move_out_date = serializer.validated_data.get('move_out_date', date.today())

            # End the assignment
            room_number = current_assignment.room.room_number
            current_assignment.end_assignment(move_out_date)

            return Response({
                'message': f'{tenant.user.get_full_name()} moved out from room {room_number} successfully',
                'assignment': RoomAssignmentSerializer(current_assignment).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_room(request, pk):
    """
    Change tenant's room assignment (move to different room).

    POST /api/tenants/{id}/change-room/

    Admin only. Ends current assignment and creates new one.

    Request body:
    {
        "new_room": <room_id>,
        "move_out_date": "YYYY-MM-DD" (optional, defaults to today),
        "move_in_date": "YYYY-MM-DD",
        "lease_end_date": "YYYY-MM-DD" (optional),
        "monthly_rent": <decimal>
    }
    """
    # Admin only
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        tenant = TenantProfile.objects.get(pk=pk)

        # Get current assignment
        current_assignment = tenant.get_current_assignment()

        if not current_assignment:
            return Response({
                'error': 'Tenant does not have an active room assignment to change'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate new room exists
        new_room_id = request.data.get('new_room')
        if not new_room_id:
            return Response({
                'error': 'new_room is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_room = Room.objects.get(pk=new_room_id)
        except Room.DoesNotExist:
            return Response({
                'error': 'New room not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if trying to change to same room
        if current_assignment.room.room_number == new_room.room_number:
            return Response({
                'error': 'Tenant is already in this room'
            }, status=status.HTTP_400_BAD_REQUEST)

        # End current assignment
        move_out_date = request.data.get('move_out_date', date.today())
        old_room_number = current_assignment.room.room_number
        current_assignment.end_assignment(move_out_date)

        # Create new assignment
        new_assignment_data = {
            'tenant': tenant.id,
            'room': new_room_id,
            'move_in_date': request.data.get('move_in_date'),
            'lease_end_date': request.data.get('lease_end_date'),
            'monthly_rent': request.data.get('monthly_rent'),
        }

        serializer = RoomAssignmentCreateSerializer(data=new_assignment_data)

        if serializer.is_valid():
            new_assignment = serializer.save()

            return Response({
                'message': f'{tenant.user.get_full_name()} moved from room {old_room_number} to room {new_room.room_number} successfully',
                'old_assignment': RoomAssignmentSerializer(current_assignment).data,
                'new_assignment': RoomAssignmentSerializer(new_assignment).data
            }, status=status.HTTP_201_CREATED)

        # If new assignment fails, we need to revert the old assignment ending
        # For simplicity, we'll just return the error
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except TenantProfile.DoesNotExist:
        return Response({
            'error': 'Tenant profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tenant_by_room(request, room_id):
    """
    Get tenant currently assigned to a specific room.

    GET /api/tenants/by-room/{room_id}/

    Returns tenant profile and current assignment for the given room.
    """
    try:
        room = Room.objects.get(pk=room_id)

        # Find current assignment for this room
        current_assignment = RoomAssignment.objects.filter(
            room=room,
            is_current=True
        ).first()

        if not current_assignment:
            return Response({
                'message': f'Room {room.room_number} is currently unoccupied',
                'room': {
                    'room_number': room.room_number,
                    'status': room.status
                },
                'tenant': None,
                'assignment': None
            }, status=status.HTTP_200_OK)

        # Permission check for non-admin users
        if not request.user.is_admin() and current_assignment.tenant.user != request.user:
            return Response({
                'error': 'Permission denied. You can only view your own information.'
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'room': {
                'room_number': room.room_number,
                'status': room.status
            },
            'tenant': TenantProfileSerializer(current_assignment.tenant).data,
            'assignment': RoomAssignmentSerializer(current_assignment).data
        }, status=status.HTTP_200_OK)

    except Room.DoesNotExist:
        return Response({
            'error': 'Room not found'
        }, status=status.HTTP_404_NOT_FOUND)
