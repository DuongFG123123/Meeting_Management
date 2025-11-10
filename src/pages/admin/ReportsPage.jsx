import React, { useEffect, useState } from "react";
import { Button, Tabs, DatePicker, Space, Spin } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import dayjs from "dayjs";
import {
  getRoomUsageReport,
  getCancelStats
} from "../../services/reportService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ReportPage = () => {
  const [roomUsageData, setRoomUsageData] = useState([]);
  const [cancelStatsData, setCancelStatsData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

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
        getCancelStats(from, to)
      ]);
      setRoomUsageData(rooms.data || []);
      setCancelStatsData(cancelStats.data || []);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
    }
    setTimeout(() => setIsLoading(false), 350);
  };

  const exportToExcel = (data, filename) => {
    if (!data.length) return alert("Không có dữ liệu để xuất");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    if (!data.length) return alert("Không có dữ liệu để xuất");
    const doc = new jsPDF();
    doc.text(filename, 14, 10);
    doc.autoTable({
      head: [Object.keys(data[0] || {})],
      body: data.map((row) => Object.values(row)),
    });
    doc.save(`${filename}.pdf`);
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
    labels: roomUsageData.map((item) => item.roomName),
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
    labels: cancelStatsData.map((item) => item.reason),
    datasets: [
      {
        label: "Số lần hủy",
        data: cancelStatsData.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
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
