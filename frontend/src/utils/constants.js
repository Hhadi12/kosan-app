/**
 * Application Constants
 *
 * This file contains all constant values used throughout the application.
 * All user-facing text is in Bahasa Indonesia.
 */

/**
 * Room Type Labels (Indonesian)
 */
export const ROOM_TYPES = {
  single: 'Kamar Single',
  double: 'Kamar Double',
  shared: 'Kamar Bersama',
};

/**
 * Room Type Options for Dropdowns
 */
export const ROOM_TYPE_OPTIONS = [
  { value: 'single', label: 'Kamar Single' },
  { value: 'double', label: 'Kamar Double' },
  { value: 'shared', label: 'Kamar Bersama' },
];

/**
 * Room Status Configuration
 * Includes label, color scheme for badges
 */
export const ROOM_STATUS = {
  available: {
    label: 'Tersedia',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  occupied: {
    label: 'Terisi',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  maintenance: {
    label: 'Pemeliharaan',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
};

/**
 * Room Status Options for Dropdowns
 */
export const ROOM_STATUS_OPTIONS = [
  { value: 'available', label: 'Tersedia' },
  { value: 'occupied', label: 'Terisi' },
  { value: 'maintenance', label: 'Pemeliharaan' },
];

/**
 * Form Field Labels (Indonesian)
 */
export const FORM_LABELS = {
  room_number: 'Nomor Kamar',
  room_type: 'Tipe Kamar',
  floor: 'Lantai',
  capacity: 'Kapasitas',
  price: 'Harga',
  status: 'Status',
  facilities: 'Fasilitas',
  description: 'Deskripsi',
};

/**
 * Page Titles (Indonesian)
 */
export const PAGE_TITLES = {
  roomList: 'Daftar Kamar',
  roomDetail: 'Detail Kamar',
  createRoom: 'Tambah Kamar Baru',
  editRoom: 'Edit Kamar',
};

/**
 * Button Labels (Indonesian)
 */
export const BUTTON_LABELS = {
  create: 'Tambah Kamar',
  save: 'Simpan',
  cancel: 'Batal',
  edit: 'Edit',
  delete: 'Hapus',
  back: 'Kembali',
  view: 'Lihat Detail',
  search: 'Cari',
  filter: 'Filter',
  clearFilter: 'Hapus Filter',
  confirm: 'Konfirmasi',
  close: 'Tutup',
};

/**
 * Success Messages (Indonesian)
 */
export const SUCCESS_MESSAGES = {
  roomCreated: 'Kamar berhasil dibuat',
  roomUpdated: 'Kamar berhasil diperbarui',
  roomDeleted: 'Kamar berhasil dihapus',
};

/**
 * Error Messages (Indonesian)
 */
export const ERROR_MESSAGES = {
  fetchRooms: 'Gagal memuat data kamar',
  fetchRoom: 'Gagal memuat detail kamar',
  createRoom: 'Gagal membuat kamar',
  updateRoom: 'Gagal memperbarui kamar',
  deleteRoom: 'Gagal menghapus kamar',
  roomNotFound: 'Kamar tidak ditemukan',
  permissionDenied: 'Akses ditolak. Hanya admin yang dapat melakukan aksi ini',
  occupiedRoomDelete: 'Tidak dapat menghapus kamar yang sedang terisi',
};

/**
 * Validation Messages (Indonesian)
 */
export const VALIDATION_MESSAGES = {
  required: (field) => `${field} wajib diisi`,
  positive: (field) => `${field} harus lebih dari 0`,
  minFloor: 'Lantai minimal adalah 1',
  capacityRange: 'Kapasitas harus antara 1-10 orang',
  singleCapacity: 'Kamar single harus berkapasitas 1 orang',
  doubleCapacity: 'Kamar double maksimal berkapasitas 2 orang',
};

/**
 * Empty State Messages (Indonesian)
 */
export const EMPTY_MESSAGES = {
  noRooms: 'Tidak ada kamar ditemukan',
  noRoomsFilter: 'Tidak ada kamar yang sesuai dengan filter',
  noRoomsCreate: 'Belum ada kamar. Tambah kamar pertama Anda!',
};

/**
 * Loading Messages (Indonesian)
 */
export const LOADING_MESSAGES = {
  loading: 'Memuat...',
  loadingRooms: 'Memuat data kamar...',
  saving: 'Menyimpan...',
  deleting: 'Menghapus...',
};

/**
 * Confirmation Messages (Indonesian)
 */
export const CONFIRM_MESSAGES = {
  deleteRoom: (roomNumber) => `Apakah Anda yakin ingin menghapus kamar ${roomNumber}?`,
  deleteWarning: 'Tindakan ini tidak dapat dibatalkan',
  occupiedWarning: 'Kamar ini sedang terisi dan tidak dapat dihapus',
};

/**
 * Info Messages (Indonesian)
 */
export const INFO_MESSAGES = {
  capacityHint: 'Single: 1 orang, Double: maksimal 2 orang, Shared: 1-10 orang',
  pricePerMonth: 'per bulan',
  requiredFields: 'Kolom bertanda * wajib diisi',
};
