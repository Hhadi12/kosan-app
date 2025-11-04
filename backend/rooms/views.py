from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Room
from .serializers import (
    RoomSerializer,
    RoomCreateUpdateSerializer,
    RoomListSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_rooms(request):
    """
    List all rooms with optional filtering.

    GET /api/rooms/

    Query Parameters:
    - status: Filter by status (available, occupied, maintenance)
    - room_type: Filter by room type (single, double, shared)
    - floor: Filter by floor number
    - min_price: Filter by minimum price
    - max_price: Filter by maximum price
    """
    rooms = Room.objects.all()

    # Apply filters based on query parameters
    room_status = request.query_params.get('status', None)
    if room_status:
        rooms = rooms.filter(status=room_status)

    room_type = request.query_params.get('room_type', None)
    if room_type:
        rooms = rooms.filter(room_type=room_type)

    floor = request.query_params.get('floor', None)
    if floor:
        rooms = rooms.filter(floor=floor)

    min_price = request.query_params.get('min_price', None)
    if min_price:
        rooms = rooms.filter(price__gte=min_price)

    max_price = request.query_params.get('max_price', None)
    if max_price:
        rooms = rooms.filter(price__lte=max_price)

    # Use lightweight serializer for list view
    serializer = RoomListSerializer(rooms, many=True)

    return Response({
        'count': rooms.count(),
        'rooms': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    """
    Create a new room (admin only).

    POST /api/rooms/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = RoomCreateUpdateSerializer(data=request.data)

    if serializer.is_valid():
        room = serializer.save()

        # Return full room data
        response_serializer = RoomSerializer(room)

        return Response({
            'message': 'Room created successfully',
            'room': response_serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room(request, pk):
    """
    Get specific room details.

    GET /api/rooms/{id}/
    """
    try:
        room = Room.objects.get(pk=pk)
        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({
            'error': 'Room not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_room(request, pk):
    """
    Update room information (admin only).

    PUT /api/rooms/{id}/  - Full update
    PATCH /api/rooms/{id}/ - Partial update
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        room = Room.objects.get(pk=pk)

        # partial=True allows partial updates for PATCH
        partial = request.method == 'PATCH'
        serializer = RoomCreateUpdateSerializer(
            room,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():
            serializer.save()

            # Return full room data
            response_serializer = RoomSerializer(room)

            return Response({
                'message': 'Room updated successfully',
                'room': response_serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Room.DoesNotExist:
        return Response({
            'error': 'Room not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, pk):
    """
    Delete a room (admin only).

    DELETE /api/rooms/{id}/
    """
    # Check if user is admin
    if not request.user.is_admin():
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        room = Room.objects.get(pk=pk)

        # Check if room is occupied before deletion
        if room.is_occupied():
            return Response({
                'error': 'Cannot delete occupied room. Please change status first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        room_number = room.room_number
        room.delete()

        return Response({
            'message': f'Room {room_number} deleted successfully'
        }, status=status.HTTP_200_OK)

    except Room.DoesNotExist:
        return Response({
            'error': 'Room not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_rooms(request):
    """
    Get list of available rooms only.

    GET /api/rooms/available/
    """
    rooms = Room.objects.filter(status='available')
    serializer = RoomListSerializer(rooms, many=True)

    return Response({
        'count': rooms.count(),
        'rooms': serializer.data
    }, status=status.HTTP_200_OK)
