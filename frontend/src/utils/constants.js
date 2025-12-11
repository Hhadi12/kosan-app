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

// ============================================================================
// COMPLAINT MANAGEMENT CONSTANTS
// ============================================================================

/**
 * Complaint Categories
 */
export const COMPLAINT_CATEGORIES = {
  maintenance: {
    value: 'maintenance',
    label: 'Pemeliharaan/Perbaikan',
    icon: '🔧',
    color: 'blue',
  },
  facilities: {
    value: 'facilities',
    label: 'Fasilitas',
    icon: '🏢',
    color: 'green',
  },
  cleanliness: {
    value: 'cleanliness',
    label: 'Kebersihan',
    icon: '🧹',
    color: 'teal',
  },
  noise: {
    value: 'noise',
    label: 'Kebisingan',
    icon: '🔊',
    color: 'orange',
  },
  security: {
    value: 'security',
    label: 'Keamanan',
    icon: '🔒',
    color: 'red',
  },
  other: {
    value: 'other',
    label: 'Lainnya',
    icon: '📝',
    color: 'gray',
  },
};

/**
 * Complaint Category Options for Dropdowns
 */
export const COMPLAINT_CATEGORY_OPTIONS = [
  { value: 'maintenance', label: 'Pemeliharaan/Perbaikan' },
  { value: 'facilities', label: 'Fasilitas' },
  { value: 'cleanliness', label: 'Kebersihan' },
  { value: 'noise', label: 'Kebisingan' },
  { value: 'security', label: 'Keamanan' },
  { value: 'other', label: 'Lainnya' },
];

/**
 * Complaint Status Configuration
 */
export const COMPLAINT_STATUS = {
  open: {
    value: 'open',
    label: 'Baru',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  in_progress: {
    value: 'in_progress',
    label: 'Dalam Proses',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  resolved: {
    value: 'resolved',
    label: 'Selesai',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  closed: {
    value: 'closed',
    label: 'Ditutup',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  },
};

/**
 * Complaint Status Options for Dropdowns
 */
export const COMPLAINT_STATUS_OPTIONS = [
  { value: 'open', label: 'Baru' },
  { value: 'in_progress', label: 'Dalam Proses' },
  { value: 'resolved', label: 'Selesai' },
  { value: 'closed', label: 'Ditutup' },
];

/**
 * Complaint Priority Configuration
 */
export const COMPLAINT_PRIORITY = {
  low: {
    value: 'low',
    label: 'Rendah',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  },
  medium: {
    value: 'medium',
    label: 'Sedang',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  high: {
    value: 'high',
    label: 'Tinggi',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
  },
  urgent: {
    value: 'urgent',
    label: 'Mendesak',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
};

/**
 * Complaint Priority Options for Dropdowns
 */
export const COMPLAINT_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
  { value: 'urgent', label: 'Mendesak' },
];

/**
 * Complaint Page Titles
 */
export const COMPLAINT_PAGE_TITLES = {
  complaintList: 'Daftar Keluhan',
  myComplaints: 'Keluhan Saya',
  complaintDetail: 'Detail Keluhan',
  createComplaint: 'Buat Keluhan Baru',
};

/**
 * Complaint Form Labels
 */
export const COMPLAINT_FORM_LABELS = {
  title: 'Judul Keluhan',
  description: 'Deskripsi Keluhan',
  category: 'Kategori',
  priority: 'Prioritas',
  status: 'Status',
  room: 'Kamar (Opsional)',
  attachment: 'Foto Bukti (Opsional)',
  resolutionNotes: 'Catatan Penyelesaian',
  comment: 'Komentar',
};

/**
 * Complaint Button Labels
 */
export const COMPLAINT_BUTTON_LABELS = {
  createComplaint: 'Buat Keluhan',
  submitComplaint: 'Kirim Keluhan',
  updateStatus: 'Perbarui Status',
  addComment: 'Tambah Komentar',
  resolve: 'Tandai Selesai',
  close: 'Tutup Keluhan',
  uploadPhoto: 'Unggah Foto',
  viewDetail: 'Lihat Detail',
  backToList: 'Kembali ke Daftar',
  cancel: 'Batal',
  delete: 'Hapus',
  deleteComment: 'Hapus Komentar',
};

/**
 * Complaint Success Messages
 */
export const COMPLAINT_SUCCESS_MESSAGES = {
  complaintCreated: 'Keluhan berhasil dibuat',
  complaintUpdated: 'Keluhan berhasil diperbarui',
  complaintDeleted: 'Keluhan berhasil dihapus',
  statusUpdated: 'Status keluhan berhasil diperbarui',
  commentAdded: 'Komentar berhasil ditambahkan',
  commentDeleted: 'Komentar berhasil dihapus',
  complaintResolved: 'Keluhan berhasil ditandai sebagai selesai',
};

/**
 * Complaint Error Messages
 */
export const COMPLAINT_ERROR_MESSAGES = {
  fetchComplaints: 'Gagal memuat daftar keluhan',
  fetchComplaintDetail: 'Gagal memuat detail keluhan',
  createComplaint: 'Gagal membuat keluhan',
  updateComplaint: 'Gagal memperbarui keluhan',
  deleteComplaint: 'Gagal menghapus keluhan',
  addComment: 'Gagal menambahkan komentar',
  deleteComment: 'Gagal menghapus komentar',
  uploadFile: 'Gagal mengunggah file',
  fetchStats: 'Gagal memuat statistik keluhan',
  titleTooShort: 'Judul harus minimal 5 karakter',
  descriptionTooShort: 'Deskripsi harus minimal 10 karakter',
  selectCategory: 'Pilih kategori keluhan',
  commentEmpty: 'Komentar tidak boleh kosong',
  fileTooLarge: 'Ukuran file maksimal 5MB',
  invalidFileType: 'Hanya file JPG, JPEG, PNG yang diperbolehkan',
  resolutionRequired: 'Catatan penyelesaian diperlukan',
};

/**
 * Complaint Empty Messages
 */
export const COMPLAINT_EMPTY_MESSAGES = {
  noComplaints: 'Belum ada keluhan',
  noComplaintsFilter: 'Tidak ada keluhan yang sesuai dengan filter',
  noComments: 'Belum ada komentar',
  noResolutionNotes: 'Belum ada catatan penyelesaian',
};

/**
 * Complaint Info Messages
 */
export const COMPLAINT_INFO_MESSAGES = {
  createComplaintHint: 'Jelaskan keluhan Anda dengan detail agar dapat ditangani dengan baik',
  attachmentHint: 'Unggah foto sebagai bukti (maksimal 5MB, format JPG/PNG)',
  resolutionRequired: 'Catatan penyelesaian diperlukan saat menandai sebagai selesai',
  deleteConfirm: 'Apakah Anda yakin ingin menghapus keluhan ini?',
  deleteCommentConfirm: 'Apakah Anda yakin ingin menghapus komentar ini?',
};

/**
 * Complaint Stats Labels (Indonesian)
 */
export const COMPLAINT_STATS_LABELS = {
  totalComplaints: 'Total Keluhan',
  openComplaints: 'Baru',
  inProgressComplaints: 'Dalam Proses',
  resolvedComplaints: 'Selesai',
  closedComplaints: 'Ditutup',
};

// ============================================================================
// PROFILE MANAGEMENT CONSTANTS
// ============================================================================

/**
 * Profile Page Titles (Indonesian)
 */
export const PROFILE_PAGE_TITLES = {
  myProfile: 'Profil Saya',
  editProfile: 'Edit Profil',
  changeEmail: 'Ubah Email',
  changePassword: 'Ubah Password',
};

/**
 * Profile Form Labels (Indonesian)
 */
export const PROFILE_FORM_LABELS = {
  userId: 'ID Pengguna',
  fullName: 'Nama Lengkap',
  firstName: 'Nama Depan',
  lastName: 'Nama Belakang',
  email: 'Email',
  phone: 'Nomor Telepon',
  role: 'Role',
  dateJoined: 'Tanggal Bergabung',
  currentPassword: 'Password Saat Ini',
  newPassword: 'Password Baru',
  confirmPassword: 'Konfirmasi Password Baru',
  newEmail: 'Email Baru',
  passwordConfirm: 'Password (Konfirmasi)',
};

/**
 * Profile Button Labels (Indonesian)
 */
export const PROFILE_BUTTON_LABELS = {
  editProfile: 'Edit Profil',
  changeEmail: 'Ubah Email',
  changePassword: 'Ubah Password',
  save: 'Simpan',
  cancel: 'Batal',
  close: 'Tutup',
};

/**
 * Profile Success Messages (Indonesian)
 */
export const PROFILE_SUCCESS_MESSAGES = {
  profileUpdated: 'Profil berhasil diperbarui',
  emailChanged: 'Email berhasil diubah',
  passwordChanged: 'Password berhasil diubah',
};

/**
 * Profile Error Messages (Indonesian)
 */
export const PROFILE_ERROR_MESSAGES = {
  fetchProfile: 'Gagal memuat profil',
  updateProfile: 'Gagal memperbarui profil',
  changeEmail: 'Gagal mengubah email',
  changePassword: 'Gagal mengubah password',
  wrongPassword: 'Password salah',
  passwordMismatch: 'Password baru tidak cocok',
  emailInUse: 'Email sudah digunakan',
  passwordTooShort: 'Password minimal 8 karakter',
  invalidPhone: 'Nomor telepon tidak valid',
};

/**
 * Profile Loading Messages (Indonesian)
 */
export const PROFILE_LOADING_MESSAGES = {
  loadingProfile: 'Memuat profil...',
  savingProfile: 'Menyimpan profil...',
  changingEmail: 'Mengubah email...',
  changingPassword: 'Mengubah password...',
};

/**
 * Profile Info Messages (Indonesian)
 */
export const PROFILE_INFO_MESSAGES = {
  passwordMinLength: 'Password minimal 8 karakter',
  emailConfirmRequired: 'Masukkan password untuk mengonfirmasi perubahan email',
  cannotChangeRole: 'Role tidak dapat diubah',
  tenantInfoLabel: 'Informasi Penghuni',
  currentRoom: 'Kamar Saat Ini',
  moveInDate: 'Tanggal Masuk',
  status: 'Status',
};

/**
 * Role Labels (Indonesian)
 */
export const ROLE_LABELS = {
  admin: 'Admin',
  user: 'Penghuni',
};

// =============================================================================
// HISTORY CONSTANTS (Phase 8.4)
// =============================================================================

/**
 * History Section Labels (Indonesian)
 */
export const HISTORY_LABELS = {
  SECTION_TITLE: 'Riwayat 12 Bulan Terakhir',
  PAYMENT_HISTORY: 'Riwayat Pembayaran',
  COMPLAINT_HISTORY: 'Riwayat Keluhan',
  ON_TIME: 'Tepat Waktu',
  LATE: 'Terlambat',
  UNPAID: 'Belum Bayar',
  TOTAL_COMPLAINTS: 'Total Keluhan',
  LAST_12_MONTHS: '(12 bulan)',
  NO_PAYMENT_HISTORY: 'Tidak ada riwayat pembayaran.',
  NO_COMPLAINT_HISTORY: 'Tidak ada riwayat keluhan.',
  LOADING: 'Memuat riwayat...',
  LOAD_ERROR: 'Tidak dapat memuat riwayat.',
};

/**
 * History Status Colors
 */
export const HISTORY_STATUS_COLORS = {
  on_time: {
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  late: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  unpaid: {
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
  complaint: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
};
