import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MONTH_NAMES } from '../utils/constants';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * RevenueChart Component (Feature J)
 *
 * Displays monthly revenue chart using Chart.js
 * Shows paid (revenue) and pending amounts as stacked bars
 *
 * @param {array} monthlyData - Array of monthly revenue data from API
 */
const RevenueChart = ({ monthlyData }) => {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Grafik Pendapatan Bulanan
        </h3>
        <p className="text-gray-500 text-center py-8">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  // Prepare data for Chart.js
  const labels = monthlyData.map((item) => MONTH_NAMES[item.month - 1]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Pendapatan (Lunas)',
        data: monthlyData.map((item) => parseFloat(item.revenue || 0)),
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // Green
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Tertunda',
        data: monthlyData.map((item) => parseFloat(item.pending || 0)),
        backgroundColor: 'rgba(234, 179, 8, 0.7)', // Yellow
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 1,
      },
      {
        label: 'Terlambat',
        data: monthlyData.map((item) => parseFloat(item.overdue || 0)),
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Grafik Pendapatan Bulanan',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: Rp ${value.toLocaleString('id-ID')}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            // Format as millions (e.g., "1.5M")
            if (value >= 1000000) {
              return `Rp ${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `Rp ${(value / 1000).toFixed(0)}K`;
            }
            return `Rp ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Summary below chart */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Pendapatan</p>
            <p className="text-lg font-bold text-green-600">
              Rp{' '}
              {monthlyData
                .reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Tertunda</p>
            <p className="text-lg font-bold text-yellow-600">
              Rp{' '}
              {monthlyData
                .reduce((sum, item) => sum + parseFloat(item.pending || 0), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Terlambat</p>
            <p className="text-lg font-bold text-red-600">
              Rp{' '}
              {monthlyData
                .reduce((sum, item) => sum + parseFloat(item.overdue || 0), 0)
                .toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
