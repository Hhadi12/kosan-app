import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatPrice } from './formatters';

/**
 * Export utilities for room data
 * Supports Print, CSV, and PDF formats
 */

// Map room type values to Indonesian labels
const ROOM_TYPE_LABELS = {
  single: 'Single',
  double: 'Double',
  shared: 'Bersama',
};

// Map status values to Indonesian labels
const STATUS_LABELS = {
  available: 'Tersedia',
  occupied: 'Terisi',
  maintenance: 'Pemeliharaan',
};

/**
 * Print room list
 * Opens browser print dialog with formatted room table
 */
export const printRooms = (rooms) => {
  const printWindow = window.open('', '_blank');
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daftar Kamar - Kosan App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #1F2937;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          color: #6B7280;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #E5E7EB;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #F3F4F6;
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-available {
          background-color: #D1FAE5;
          color: #065F46;
        }
        .status-occupied {
          background-color: #DBEAFE;
          color: #1E40AF;
        }
        .status-maintenance {
          background-color: #FEF3C7;
          color: #92400E;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #9CA3AF;
          font-size: 12px;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Daftar Kamar Kosan</h1>
      <div class="subtitle">Total: ${rooms.length} kamar</div>
      <table>
        <thead>
          <tr>
            <th>No. Kamar</th>
            <th>Tipe</th>
            <th>Lantai</th>
            <th>Kapasitas</th>
            <th>Harga/Bulan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rooms
            .map(
              (room) => `
            <tr>
              <td>${room.room_number}</td>
              <td>${ROOM_TYPE_LABELS[room.room_type]}</td>
              <td>${room.floor}</td>
              <td>${room.capacity} orang</td>
              <td>${formatPrice(room.price)}</td>
              <td>
                <span class="status status-${room.status}">
                  ${STATUS_LABELS[room.status]}
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="footer">
        Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};

/**
 * Export room list to CSV
 * Downloads CSV file with room data
 */
export const exportToCSV = (rooms) => {
  const headers = ['No. Kamar', 'Tipe', 'Lantai', 'Kapasitas', 'Harga', 'Status', 'Fasilitas', 'Deskripsi'];

  const csvContent = [
    headers.join(','),
    ...rooms.map((room) =>
      [
        room.room_number,
        ROOM_TYPE_LABELS[room.room_type],
        room.floor,
        room.capacity,
        room.price,
        STATUS_LABELS[room.status],
        `"${room.facilities || '-'}"`, // Wrap in quotes to handle commas
        `"${room.description || '-'}"`,
      ].join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `daftar-kamar-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export room list to PDF
 * Downloads PDF file with formatted room table
 */
export const exportToPDF = (rooms) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Kamar Kosan', 105, 15, { align: 'center' });

  // Add subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${rooms.length} kamar`, 105, 22, { align: 'center' });

  // Prepare table data
  const tableData = rooms.map((room) => [
    room.room_number,
    ROOM_TYPE_LABELS[room.room_type],
    room.floor.toString(),
    room.capacity.toString() + ' orang',
    formatPrice(room.price),
    STATUS_LABELS[room.status],
  ]);

  // Add table
  doc.autoTable({
    startY: 30,
    head: [['No. Kamar', 'Tipe', 'Lantai', 'Kapasitas', 'Harga/Bulan', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35 },
      5: { cellWidth: 30 },
    },
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    const footerText = `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} - Halaman ${i} dari ${pageCount}`;
    doc.text(footerText, 105, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`daftar-kamar-${timestamp}.pdf`);
};
