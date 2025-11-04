import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/AdminDashboard";
import Users from "@/pages/UserList";
import Rooms from "@/pages/RoomList";
import Devices from "@/pages/DeviceList";
import Reports from "@/pages/ReportPage";

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
