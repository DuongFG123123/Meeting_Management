import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const toastColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#e4650aff",
  info: "#3b82f6",
};

const setToastTheme = () => {
  const root = document.documentElement;
  root.style.setProperty("--toastify-color-success", toastColors.success);
  root.style.setProperty("--toastify-color-error", toastColors.error);
  root.style.setProperty("--toastify-color-warning", toastColors.warning);
  root.style.setProperty("--toastify-color-info", toastColors.info);
};
setToastTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
          <App />
        </div>
      </AuthProvider>

      <ToastContainer
        position="top-right"
        autoClose={2600}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
        theme="colored"
        toastStyle={{
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 500,
          padding: "12px 18px",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
        progressStyle={{
          background: "#2563eb",
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
