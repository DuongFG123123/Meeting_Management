// src/pages/admin/ReportPage.jsx
import React, { useEffect, useState } from "react";
import { Button, Tabs, DatePicker, Space, Spin, Card } from "antd";
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

  // 🔄 Theo dõi thay đổi theme
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

  // 🔁 Lấy dữ liệu ban đầu
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
      console.error("❌ Lỗi tải báo cáo:", error);
      toast.error("Không thể tải dữ liệu báo cáo!");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Xuất file CSV
  const exportToCSV = (data, filename) => {
    if (!data.length)
      return toast.info("Không có dữ liệu để xuất!", { autoClose: 2000 });

    const headers = Object.keys(data[0]);
    const rows = data.map((item) => Object.values(item));
    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("📊 Xuất Excel thành công!");
  };

  // ✅ Xuất PDF
  const exportToPDF = (data, filename) => {
    if (!data.length)
      return toast.info("📭 Không có dữ liệu để xuất!", { autoClose: 2000 });

    const doc = new jsPDF();
    doc.text(filename, 14, 10);
    doc.autoTable({
      head: [Object.keys(data[0] || {})],
      body: data.map((row) => Object.values(row)),
    });
    doc.save(`${filename}.pdf`);

    toast.success("🧾 Xuất PDF thành công!");
  };

  // ✅ Nút xuất file
const renderActions = (data, filename) => (
  <div className="mb-4 flex gap-3">
    {/* Nút Xuất Excel */}
    <Button
      type="primary"
      onClick={() => exportToCSV(data, filename)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold 
        transition-all duration-300 border-none shadow-sm
        bg-[#2563eb] hover:bg-[#1d4ed8] text-white
        dark:bg-[#3b82f6] dark:hover:bg-[#60a5fa] dark:shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
    >
      📊 <span>Xuất Excel</span>
    </Button>

    {/* Nút Xuất PDF (màu đỏ nền đầy) */}
    <Button
      onClick={() => exportToPDF(data, filename)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white
        transition-all duration-300 shadow-sm
        bg-[#ef4444] hover:bg-[#dc2626]
        dark:bg-[#f87171] dark:hover:bg-[#fca5a5]
        dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]`}
    >
      🧾 <span>Xuất PDF</span>
    </Button>
  </div>
);

  // 🎨 Biểu đồ
  const textColor = isDarkMode ? "#f1f5f9" : "#1f2937";
  const gridColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const roomChartData = {
    labels: roomUsageData.map((item) => item.roomName),
    datasets: [
      {
        label: "Số giờ sử dụng",
        data: roomUsageData.map((item) => item.totalHoursBooked),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
      {
        label: "Số lần đặt",
        data: roomUsageData.map((item) => item.bookingCount),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  const cancelChartData = {
    labels: cancelStatsData.map((item) => item.reason),
    datasets: [
      {
        label: "Số lần hủy",
        data: cancelStatsData.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
    plugins: {
      legend: { labels: { color: textColor } },
    },
  };

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0d1117] text-slate-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme={isDarkMode ? "dark" : "light"}
      />

      <Card
        title={
          <span
            className={`text-base font-semibold ${
              isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}
          >
            📈 Báo cáo & Thống kê sử dụng phòng họp
          </span>
        }
        bordered={false}
        className={`rounded-2xl shadow-md transition-all duration-300 ${
          isDarkMode ? "bg-[#161b22] text-slate-100" : "bg-white text-gray-900"
        }`}
      >
        <Space className="mb-5">
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
            className="rounded-md transition-all duration-300 
              dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
              dark:hover:border-blue-400 dark:[&_input]:text-slate-100
              dark:[&_svg]:text-slate-200"
          />
        </Space>

        <Spin spinning={isLoading}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="dark:[&_.ant-tabs-tab-btn]:text-slate-300 
                       dark:[&_.ant-tabs-tab-btn:hover]:text-blue-400 
                       dark:[&_.ant-tabs-tab-btn-active]:text-blue-400"
            items={[
              {
                key: "1",
                label: "📊 Tần suất sử dụng phòng",
                children: (
                  <>
                    {renderActions(roomUsageData, "bao_cao_phong_hop")}
                    {roomUsageData.length ? (
                      <div className="w-full h-[500px]">
                        <Bar data={roomChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        Không có dữ liệu phòng họp trong thời gian đã chọn.
                      </p>
                    )}
                  </>
                ),
              },
              {
                key: "2",
                label: "❌ Lý do hủy họp",
                children: (
                  <>
                    {renderActions(cancelStatsData, "bao_cao_huy_hop")}
                    {cancelStatsData.length ? (
                      <div className="w-[700px] h-[500px]">
                        <Pie
                          data={cancelChartData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              legend: {
                                position: "right",
                                labels: { color: textColor },
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-200">
                        Không có dữ liệu hủy họp trong thời gian đã chọn.
                      </p>
                    )}
                  </>
                ),
              },
            ]}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ReportPage;
