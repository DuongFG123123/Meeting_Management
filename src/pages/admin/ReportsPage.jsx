// src/pages/admin/ReportPage.jsx
import React, { useEffect, useState } from "react";
import { DatePicker, Tabs, Spin } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import dayjs from "dayjs";
import { getRoomUsageReport, getCancelStats } from "../../services/reportService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import { FiBarChart2, FiDownload } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const { RangePicker } = DatePicker;

const ReportPage = () => {
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [cancelStatsData, setCancelStatsData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Theo dõi thay đổi theme (dark / light)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Lấy dữ liệu mặc định
  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = today;
    setDateRange([start, end]);
    fetchReports(start, end);
  }, []);

  const fetchReports = async (fromDate, toDate) => {
    setIsLoading(true);
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    try {
      const [rooms, cancelStats] = await Promise.all([
        getRoomUsageReport(from, to),
        getCancelStats(from, to),
      ]);
      setRoomUsageData(rooms.data || []);
      setCancelStatsData(cancelStats.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu báo cáo!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xuất CSV/Excel
  const exportToCSV = (data, filename) => {
    if (!data.length) return toast.info("Không có dữ liệu để xuất!");
    const headers = Object.keys(data[0]);
    const rows = data.map((i) => Object.values(i));
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    toast.success("📊 Đã xuất Excel!");
  };

  // Xuất PDF
  const exportToPDF = (data, filename) => {
    if (!data.length) return toast.info("Không có dữ liệu để xuất!");
    const doc = new jsPDF();
    doc.text(filename, 14, 10);
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((r) => Object.values(r)),
    });
    doc.save(`${filename}.pdf`);
    toast.success("🧾 Đã xuất PDF!");
  };

  // Chart data
  const textColor = isDarkMode ? "#e2e8f0" : "#1f2937";
  const gridColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  const roomChartData = {
    labels: roomUsageData.map((r) => r.roomName),
    datasets: [
      {
        label: "Số giờ sử dụng",
        data: roomUsageData.map((r) => r.totalHoursBooked),
        backgroundColor: isDarkMode ? "#3c76d3ff" : "#2563eb",
      },
      {
        label: "Số lần đặt",
        data: roomUsageData.map((r) => r.bookingCount),
        backgroundColor: isDarkMode ? "#60a5fa" : "#428fbcff",
      },
    ],
  };

  const cancelChartData = {
    labels: cancelStatsData.map((r) => r.reason),
    datasets: [
      {
        label: "Số lần hủy",
        data: cancelStatsData.map((r) => r.count),
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#facc15",
          "#22c55e",
          "#3b82f6",
          "#8b5cf6",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: textColor },
      },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0d1117] text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      <ToastContainer autoClose={2000} theme={isDarkMode ? "dark" : "light"} />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiBarChart2 className={`text-3xl ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
            Báo cáo & Thống kê sử dụng phòng họp
          </h1>
        </div>
      </div>

      {/* THANH CHỌN NGÀY + NÚT XUẤT */}
      <div
        className={`p-4 rounded-2xl shadow-md border mb-6 flex flex-col md:flex-row md:items-center gap-3 ${
          isDarkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <RangePicker
          onChange={(dates) => {
            if (dates) {
              const start = dates[0].toDate();
              const end = dates[1].toDate();
              setDateRange([start, end]);
              fetchReports(start, end);
            }
          }}
          value={dateRange.map((d) => dayjs(d))}
          format="YYYY-MM-DD"
          className={`rounded-lg ${
            isDarkMode ? "bg-[#0d1117] text-gray-200 border-gray-600" : "border-gray-300"
          }`}
        />

        <div className="flex gap-3 md:ml-auto">
          <button
            onClick={() =>
              exportToCSV(
                activeTab === "1" ? roomUsageData : cancelStatsData,
                activeTab === "1" ? "bao_cao_su_dung" : "bao_cao_huy_hop"
              )
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow active:scale-95 transition"
          >
            <FiDownload /> Xuất Excel
          </button>
          <button
            onClick={() =>
              exportToPDF(
                activeTab === "1" ? roomUsageData : cancelStatsData,
                activeTab === "1" ? "bao_cao_su_dung" : "bao_cao_huy_hop"
              )
            }
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow active:scale-95 transition"
          >
            🧾 Xuất PDF
          </button>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <Spin spinning={isLoading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className={`${
            isDarkMode
              ? "dark:[&_.ant-tabs-tab-btn]:text-gray-300 dark:[&_.ant-tabs-tab-btn:hover]:text-blue-400"
              : ""
          }`}
          items={[
            {
              key: "1",
              label: "📊 Tần suất sử dụng phòng",
              children: (
                <div
                  className={`rounded-2xl shadow-sm p-6 min-h-[450px] flex justify-center items-center ${
                    isDarkMode ? "bg-[#161b22] border border-gray-700" : "bg-white border border-gray-200"
                  }`}
                >
                  {roomUsageData.length ? (
                    <div className="w-full h-[420px]">
                      <Bar data={roomChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Không có dữ liệu phòng họp trong thời gian đã chọn.
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "2",
              label: "❌ Lý do hủy họp",
              children: (
                <div
                  className={`rounded-2xl shadow-sm p-6 min-h-[450px] flex justify-center items-center ${
                    isDarkMode ? "bg-[#161b22] border border-gray-700" : "bg-white border border-gray-200"
                  }`}
                >
                  {cancelStatsData.length ? (
                    <div className="w-[400px] h-[400px]">
                      <Pie data={cancelChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Không có dữ liệu hủy họp trong thời gian đã chọn.
                    </p>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default ReportPage;
