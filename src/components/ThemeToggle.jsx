import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  // đọc từ localStorage để nhớ lựa chọn
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  // mỗi khi darkMode đổi -> thêm / bỏ class "dark" trên <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl 
                 bg-gray-100 hover:bg-gray-200 
                 dark:bg-slate-800 dark:hover:bg-slate-700
                 text-gray-700 dark:text-gray-100
                 text-xs font-medium transition-all duration-200"
      title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {darkMode ? <FiSun size={14} /> : <FiMoon size={14} />}
      <span>{darkMode ? "Sáng" : "Tối"}</span>
    </button>
  );
}
