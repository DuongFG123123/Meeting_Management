import { useEffect, useState, forwardRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = forwardRef((props, ref) => {
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

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
      ref={ref}
      onClick={() => setDarkMode(!darkMode)}
      className="w-9 h-9 flex items-center justify-center rounded-full 
                bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700
                transition-colors duration-200"
      title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  );
});

export default ThemeToggle;