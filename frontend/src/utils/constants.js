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

// ============================================================================
// TENANT MANAGEMENT CONSTANTS
// ============================================================================

/**
 * Tenant Status Configuration
 * Includes label, color scheme for badges
 */
export const TENANT_STATUS = {
  active: {
    label: 'Aktif',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Tidak Aktif',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  },
};

/**
 * Tenant Status Options for Dropdowns
 */
export const TENANT_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
];

/**
 * Tenant Page Titles (Indonesian)
 */
export const TENANT_PAGE_TITLES = {
  tenantList: 'Daftar Penghuni',
  tenantDetail: 'Detail Penghuni',
  editTenant: 'Edit Penghuni',
  myProfile: 'Profil Saya',
};

/**
 * Tenant Form Field Labels (Indonesian)
 */
export const TENANT_FORM_LABELS = {
  id_number: 'Nomor KTP',
  emergency_contact_name: 'Nama Kontak Darurat',
  emergency_contact_phone: 'Telepon Kontak Darurat',
  occupation: 'Pekerjaan',
  move_in_date: 'Tanggal Masuk',
  move_out_date: 'Tanggal Keluar',
  lease_end_date: 'Akhir Masa Sewa',
  monthly_rent: 'Sewa Bulanan',
  current_room: 'Kamar Saat Ini',
  assignment_history: 'Riwayat Kamar',
  user_name: 'Nama Lengkap',
  user_email: 'Email',
  user_phone: 'Nomor Telepon',
  select_room: 'Pilih Kamar',
};

/**
 * Tenant Button Labels (Indonesian)
 */
export const TENANT_BUTTON_LABELS = {
  addTenant: 'Tambah Penghuni',
  assignRoom: 'Tambahkan ke Kamar',
  unassign: 'Akhiri Sewa',
  changeRoom: 'Ubah Kamar',
  viewProfile: 'Lihat Profil',
  viewRoom: 'Lihat Kamar',
  editProfile: 'Edit Profil',
  viewDetail: 'Lihat Detail',
};

/**
 * Tenant Success Messages (Indonesian)
 */
export const TENANT_SUCCESS_MESSAGES = {
  tenantUpdated: 'Data penghuni berhasil diperbarui',
  tenantDeleted: 'Penghuni berhasil dihapus',
  roomAssigned: 'Penghuni berhasil ditambahkan ke kamar',
  roomUnassigned: 'Sewa kamar berhasil diakhiri',
  roomChanged: 'Kamar berhasil diubah',
};

/**
 * Tenant Error Messages (Indonesian)
 */
export const TENANT_ERROR_MESSAGES = {
  fetchTenants: 'Gagal memuat data penghuni',
  fetchTenant: 'Gagal memuat detail penghuni',
  updateTenant: 'Gagal memperbarui data penghuni',
  deleteTenant: 'Gagal menghapus penghuni',
  assignRoom: 'Gagal menambahkan ke kamar',
  unassignRoom: 'Gagal mengakhiri sewa',
  changeRoom: 'Gagal mengubah kamar',
  tenantNotFound: 'Penghuni tidak ditemukan',
  roomOccupied: 'Kamar sudah terisi',
  tenantHasAssignment: 'Penghuni sudah memiliki kamar',
  cannotDeleteWithAssignment: 'Tidak dapat menghapus penghuni yang masih menyewa kamar',
  noAvailableRooms: 'Tidak ada kamar tersedia',
};

/**
 * Tenant Empty State Messages (Indonesian)
 */
export const TENANT_EMPTY_MESSAGES = {
  noTenants: 'Tidak ada penghuni ditemukan',
  noTenantsFilter: 'Tidak ada penghuni yang sesuai dengan filter',
  noAssignmentHistory: 'Belum ada riwayat kamar',
  noCurrentAssignment: 'Belum ada kamar yang ditempati',
  noTenantInRoom: 'Kamar ini belum ditempati',
};

/**
 * Tenant Loading Messages (Indonesian)
 */
export const TENANT_LOADING_MESSAGES = {
  loadingTenants: 'Memuat data penghuni...',
  loadingProfile: 'Memuat profil...',
  savingProfile: 'Menyimpan profil...',
  assigningRoom: 'Menambahkan ke kamar...',
  unassigningRoom: 'Mengakhiri sewa...',
  changingRoom: 'Mengubah kamar...',
};

/**
 * Tenant Confirmation Messages (Indonesian)
 */
export const TENANT_CONFIRM_MESSAGES = {
  deleteTenant: (tenantName) => `Apakah Anda yakin ingin menghapus penghuni ${tenantName}?`,
  unassignRoom: (tenantName, roomNumber) =>
    `Apakah Anda yakin ingin mengakhiri sewa kamar ${roomNumber} untuk ${tenantName}?`,
  changeRoom: (oldRoom, newRoom) =>
    `Apakah Anda yakin ingin memindahkan penghuni dari kamar ${oldRoom} ke ${newRoom}?`,
  deleteWarning: 'Tindakan ini tidak dapat dibatalkan',
  hasActiveAssignment: 'Penghuni ini masih menyewa kamar dan tidak dapat dihapus',
};

/**
 * Tenant Info Messages (Indonesian)
 */
export const TENANT_INFO_MESSAGES = {
  rentPerMonth: 'per bulan',
  moveInInfo: 'Tanggal masuk penghuni ke kamar',
  leaseEndInfo: 'Tanggal berakhirnya masa sewa (opsional)',
  emergencyContactInfo: 'Kontak darurat untuk keperluan mendesak',
  assignmentHistoryInfo: 'Riwayat kamar yang pernah ditempati penghuni ini',
};

/**
 * Tenant Stats Labels (Indonesian)
 */
export const TENANT_STATS_LABELS = {
  totalTenants: 'Total Penghuni',
  activeTenants: 'Penghuni Aktif',
  inactiveTenants: 'Tidak Aktif',
  assignedTenants: 'Memiliki Kamar',
  unassignedTenants: 'Belum Ada Kamar',
};

// ============================================================================
// PAYMENT MANAGEMENT CONSTANTS
// ============================================================================

/**
 * Payment Status Configuration
 * Includes label, color scheme for badges
 */
export const PAYMENT_STATUS = {
  paid: {
    label: 'Lunas',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  pending: {
    label: 'Tertunda',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  overdue: {
    label: 'Terlambat',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  },
};

/**
 * Payment Status Options for Dropdowns
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'paid', label: 'Lunas' },
  { value: 'pending', label: 'Tertunda' },
  { value: 'overdue', label: 'Terlambat' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

/**
 * Payment Method Labels (Indonesian)
 */
export const PAYMENT_METHODS = {
  cash: 'Tunai',
  transfer: 'Transfer Bank',
  other: 'Lainnya',
};

/**
 * Payment Method Options for Dropdowns
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'other', label: 'Lainnya' },
];

/**
 * Month Names (Indonesian)
 */
export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Month Options for Dropdowns
 */
export const MONTH_OPTIONS = [
  { value: '', label: 'Semua Bulan' },
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

/**
 * Payment Page Titles (Indonesian)
 */
export const PAYMENT_PAGE_TITLES = {
  paymentList: 'Daftar Pembayaran',
  paymentDetail: 'Detail Pembayaran',
  createPayment: 'Buat Pembayaran Baru',
  myPayments: 'Pembayaran Saya',
};

/**
 * Payment Form Field Labels (Indonesian)
 */
export const PAYMENT_FORM_LABELS = {
  tenant: 'Penghuni',
  room: 'Kamar',
  period: 'Periode',
  payment_period_month: 'Bulan',
  payment_period_year: 'Tahun',
  amount: 'Jumlah',
  due_date: 'Jatuh Tempo',
  payment_date: 'Tanggal Bayar',
  status: 'Status',
  payment_method: 'Metode Pembayaran',
  payment_reference: 'Nomor Referensi',
  bank_name: 'Nama Bank',
  bank_account_name: 'Nama Pemilik Rekening',
  bank_account_number: 'Nomor Rekening',
  notes: 'Catatan',
  proof_of_payment: 'Bukti Pembayaran',
};

/**
 * Payment Button Labels (Indonesian)
 */
export const PAYMENT_BUTTON_LABELS = {
  createPayment: 'Buat Pembayaran',
  markAsPaid: 'Tandai Lunas',
  uploadProof: 'Unggah Bukti',
  downloadReceipt: 'Unduh Kwitansi',
  exportCSV: 'Ekspor CSV',
  exportPDF: 'Ekspor PDF',
  generateMonthly: 'Generate Tagihan Bulanan',
  viewPayments: 'Lihat Pembayaran',
  payNow: 'Bayar Sekarang',
};

/**
 * Payment Success Messages (Indonesian)
 */
export const PAYMENT_SUCCESS_MESSAGES = {
  paymentCreated: 'Pembayaran berhasil dibuat',
  paymentUpdated: 'Pembayaran berhasil diperbarui',
  paymentDeleted: 'Pembayaran berhasil dihapus',
  markedAsPaid: 'Pembayaran berhasil ditandai lunas',
  proofUploaded: 'Bukti pembayaran berhasil diunggah',
  receiptDownloaded: 'Kwitansi berhasil diunduh',
  paymentsExported: 'Data pembayaran berhasil diekspor',
  monthlyGenerated: 'Tagihan bulanan berhasil dibuat',
};

/**
 * Payment Error Messages (Indonesian)
 */
export const PAYMENT_ERROR_MESSAGES = {
  fetchPayments: 'Gagal memuat data pembayaran',
  fetchPayment: 'Gagal memuat detail pembayaran',
  createPayment: 'Gagal membuat pembayaran',
  updatePayment: 'Gagal memperbarui pembayaran',
  deletePayment: 'Gagal menghapus pembayaran',
  markPaidFailed: 'Gagal menandai pembayaran lunas',
  uploadFailed: 'Gagal mengunggah bukti pembayaran',
  downloadFailed: 'Gagal mengunduh kwitansi',
  exportFailed: 'Gagal mengekspor data',
  generateFailed: 'Gagal membuat tagihan bulanan',
  paymentNotFound: 'Pembayaran tidak ditemukan',
  duplicatePeriod: 'Pembayaran untuk periode ini sudah ada',
  cannotDeletePaid: 'Tidak dapat menghapus pembayaran yang sudah lunas',
  fileTooLarge: 'Ukuran file maksimal 5MB',
  invalidFileType: 'Format file harus JPG, PNG, atau PDF',
};

/**
 * Payment Empty State Messages (Indonesian)
 */
export const PAYMENT_EMPTY_MESSAGES = {
  noPayments: 'Tidak ada pembayaran ditemukan',
  noPaymentsFilter: 'Tidak ada pembayaran yang sesuai dengan filter',
  noPendingPayments: 'Semua pembayaran sudah lunas',
  noOverduePayments: 'Tidak ada pembayaran yang terlambat',
  noProofUploaded: 'Belum ada bukti pembayaran',
};

/**
 * Payment Loading Messages (Indonesian)
 */
export const PAYMENT_LOADING_MESSAGES = {
  loadingPayments: 'Memuat data pembayaran...',
  loadingStats: 'Memuat statistik...',
  creatingPayment: 'Membuat pembayaran...',
  markingPaid: 'Menandai lunas...',
  uploadingProof: 'Mengunggah bukti...',
  downloadingReceipt: 'Mengunduh kwitansi...',
  exporting: 'Mengekspor data...',
  generating: 'Membuat tagihan...',
};

/**
 * Payment Confirmation Messages (Indonesian)
 */
export const PAYMENT_CONFIRM_MESSAGES = {
  deletePayment: (period) => `Apakah Anda yakin ingin menghapus pembayaran ${period}?`,
  markAsPaid: (tenant, amount) =>
    `Tandai pembayaran dari ${tenant} sebesar ${amount} sebagai lunas?`,
  generateMonthly: (month, year) =>
    `Generate tagihan untuk semua penghuni aktif untuk periode ${month} ${year}?`,
  deleteWarning: 'Tindakan ini tidak dapat dibatalkan',
  alreadyPaid: 'Pembayaran ini sudah lunas',
};

/**
 * Payment Info Messages (Indonesian)
 */
export const PAYMENT_INFO_MESSAGES = {
  dueToday: 'Jatuh tempo hari ini',
  overdue: (days) => `Terlambat ${days} hari`,
  paidEarly: 'Dibayar lebih awal',
  paidOnTime: 'Dibayar tepat waktu',
  paidLate: (days) => `Dibayar terlambat ${days} hari`,
  uploadProofHint: 'Unggah bukti transfer (JPG, PNG, atau PDF, maks 5MB)',
  bankInfo: 'Informasi rekening untuk transfer',
  selectTenantFirst: 'Pilih penghuni terlebih dahulu',
  amountAutoFilled: 'Jumlah otomatis terisi dari harga sewa kamar',
};

/**
 * Payment Stats Labels (Indonesian)
 */
export const PAYMENT_STATS_LABELS = {
  totalPayments: 'Total Pembayaran',
  paidPayments: 'Lunas',
  pendingPayments: 'Tertunda',
  overduePayments: 'Terlambat',
  totalAmount: 'Total Jumlah',
  paidAmount: 'Sudah Dibayar',
  pendingAmount: 'Belum Dibayar',
  thisMonthRevenue: 'Pendapatan Bulan Ini',
  totalRevenue: 'Total Pendapatan',
  outstandingAmount: 'Total Tunggakan',
};

/**
 * Bank Account Information (Feature G)
 */
export const BANK_ACCOUNT = {
  bank_name: 'Bank BCA',
  account_name: 'Rahman Hadi',
  account_number: '1234567890',
};
