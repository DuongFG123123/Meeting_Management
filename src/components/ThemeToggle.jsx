// AdminLayout.jsx
import { forwardRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = forwardRef(({ darkMode, setDarkMode }, ref) => {
  return (
    <button
      ref={ref}
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 text-sm"
    >
      {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  );
});

export default ThemeToggle;