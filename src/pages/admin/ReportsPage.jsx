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

  // 🔄 Theo dõi thay đổi theme (dark / light)
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

  // 📅 Lấy dữ liệu mặc định
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

  // 📊 Xuất Excel
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

  // 🧾 Xuất PDF
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

  const renderActions = (data, filename) => (
    <div style={{ marginBottom: 16 }}>
      <Button type="primary" onClick={() => exportToExcel(data, filename)} style={{ marginRight: 8 }}>
  Xuất Excel
</Button>
<Button type="default" onClick={() => exportToPDF(data, filename)}>
  Xuất PDF
</Button>
    </div>
  );

  const roomChartData = {
    labels: roomUsageData.map((r) => r.roomName),
    datasets: [
  {
    label: "Số giờ sử dụng",
    data: roomUsageData.map((item) => item.totalHoursBooked),
    backgroundColor: "#4caf50",
  },
  {
    label: "Số lần đặt",
    data: roomUsageData.map((item) => item.bookingCount),
    backgroundColor: "#2196f3",
  }
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
    <div style={{ padding: 20, background: "#f9f9f9", borderRadius: 8 }}>
  <h2 style={{ marginBottom: 20 }}>Thống kê & Báo cáo</h2>
  <Space style={{ marginBottom: 20 }}>
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
    />
  </Space>

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
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="Phòng họp" key="1">
  {renderActions(roomUsageData, "bao_cao_phong_hop")}
  {roomUsageData.length ? (
    <div style={{ width: "100%", height: 500 }}> {/* ↓ thêm div này để thu nhỏ */}
      <Bar
        data={roomChartData}
        options={{
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 1000, easing: "easeOutQuad" },
  plugins: { legend: { position: "top" } },
  scales: {
    y: { beginAtZero: true },
    x: { ticks: { autoSkip: false } }
  },
  elements: {
    bar: { borderRadius: 4 } // thanh tròn góc
  }
}}
      />
    </div>
  ) : (
    <p>Không có dữ liệu phòng họp</p>
  )}
</TabPane>

          <TabPane tab="Lý do hủy họp" key="2">
  {renderActions(cancelStatsData, "bao_cao_huy_hop")}
  {cancelStatsData.length ? (
    <div style={{
  width: "100%",
  maxWidth: 700,
  height: 400,
  margin: "0 auto",
}}>
      <Pie
        data={cancelChartData}
        options={{
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right", labels: { boxWidth: 20, padding: 15 } },
    tooltip: { enabled: true }
  }
}}
        cx="30%"  // di chuyển tâm Pie chart sang trái
        cy="50%"
        outerRadius={120} // tuỳ chỉnh kích thước
      />
    </div>
  ) : (
    <p>Không có dữ liệu hủy họp</p>
  )}
</TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default ReportPage;
