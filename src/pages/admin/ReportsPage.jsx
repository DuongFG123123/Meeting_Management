
import React, { useEffect, useState } from "react";
import { Button, Tabs, DatePicker, Space } from "antd";
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

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = today;
    setDateRange([start, end]);
    fetchReports(start, end);
  }, []);

  const fetchReports = async (fromDate, toDate) => {
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
      <Button onClick={() => exportToExcel(data, filename)} style={{ marginRight: 8 }}>
        Xuất Excel
      </Button>
      <Button onClick={() => exportToPDF(data, filename)}>Xuất PDF</Button>
    </div>
  );

  // Biểu đồ phòng họp
  const roomChartData = {
    labels: roomUsageData.map((item) => item.roomName),
    datasets: [
      {
        label: "Số giờ sử dụng",
        data: roomUsageData.map((item) => item.usageHours),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  // Biểu đồ lý do hủy họp
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
    <div style={{ padding: 20 }}>
      <h2>Thống kê & Báo cáo</h2>
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
      <Tabs defaultActiveKey="1">
        <TabPane tab="Phòng họp" key="1">
          {renderActions(roomUsageData, "bao_cao_phong_hop")}
          {roomUsageData.length ? <Bar data={roomChartData} /> : <p>Không có dữ liệu phòng họp</p>}
        </TabPane>
        <TabPane tab="Lý do hủy họp" key="2">
          {renderActions(cancelStatsData, "bao_cao_huy_hop")}
          {cancelStatsData.length ? <Pie data={cancelChartData} /> : <p>Không có dữ liệu hủy họp</p>}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportPage;
