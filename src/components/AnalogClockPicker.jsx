// src/components/AnalogClockPicker.jsx
import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

export default function AnalogClockPicker({ value, onChange, disabledTime }) {
  const initHour = value ? value.hour() : 9;
  const initMinute = value ? value.minute() : 0;

  // Convert 24h → 12h format
  const [hour, setHour] = useState(initHour % 12 || 12);
  const [minute, setMinute] = useState(initMinute);
  const [period, setPeriod] = useState(initHour >= 12 ? "PM" : "AM");

  const clockRef = useRef(null);
  const dragging = useRef(false);
  const dragType = useRef(null);

  /** Get real 24h */
  const getRealHour = () => {
    let h = hour % 12;
    if (period === "PM") h += 12;
    return h;
  };

  /** 🔄 Emit to parent */
  useEffect(() => {
    const h = getRealHour().toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    onChange(`${h}:${m}`);
  }, [hour, minute, period]);

  /** 📐 Calculate angle */
  const getAngle = (e) => {
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
    return angle;
  };

  /** 🖱️ Start dragging */
  const startDrag = (type) => (e) => {
    dragging.current = true;
    dragType.current = type;
  };

  /** 🔄 Drag handler */
  const onMouseMove = (e) => {
    if (!dragging.current) return;

    const angle = getAngle(e);

    if (dragType.current === "minute") {
      const newMin = Math.round(angle / 6);

      // minute always allowed (no past/future check)
      setMinute(newMin);
    }

    if (dragType.current === "hour") {
      const newHour = Math.floor(angle / 30) || 12;

      // Xác định giờ thật
      const realHour = period === "PM" ? newHour + 12 : newHour;

      // Kiểm tra disableTime
      if (disabledTime && disabledTime(realHour, minute, period)) return;

      setHour(newHour);
    }
  };

  /** 🛑 Stop dragging */
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", () => (dragging.current = false));
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  /** 🟣 Check disabled hour */
  const isDisabledHour = (displayHour, p) => {
    let realHour = displayHour % 12;
    if (p === "PM") realHour += 12;

    return disabledTime && disabledTime(realHour, minute, p);
  };

  return (
    <div className="flex flex-col items-center select-none">

      {/* === HIỂN THỊ GIỜ === */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 transition-all">
          {hour.toString().padStart(2, "0")} :
          <span className="ml-1">{minute.toString().padStart(2, "0")}</span>
        </div>

        {/* AM / PM toggle */}
        <div className="flex">
          {["AM", "PM"].map((p) => {
            const disabled = [...Array(12)].every((_, i) =>
              isDisabledHour(i + 1, p)
            );

            return (
              <button
                key={p}
                disabled={disabled}
                onClick={() => !disabled && setPeriod(p)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium border transition-all
                  ${period === p ? 
                    "bg-blue-600 text-white border-blue-600" :
                    "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-100"
                  }
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* === ĐỒNG HỒ === */}
      <div
        ref={clockRef}
        className="
          relative w-64 h-64 rounded-full
          border-[3px] border-gray-300 dark:border-gray-600
          bg-white dark:bg-slate-800 shadow-xl
          transition-all
        "
      >

        {/* Kim giờ */}
        <div
          onMouseDown={startDrag("hour")}
          className="
            absolute left-1/2 top-1/2 
            w-2 bg-blue-500 origin-bottom rounded-md
            cursor-pointer
            transition-transform duration-200
          "
          style={{
            height: "55px",
            transform: `translateX(-50%) translateY(-100%) rotate(${
              hour * 30 + minute / 2
            }deg)`,
          }}
        />

        {/* Kim phút */}
        <div
          onMouseDown={startDrag("minute")}
          className="
            absolute left-1/2 top-1/2 
            w-1.5 bg-blue-600 origin-bottom rounded-md
            cursor-pointer
            transition-transform duration-200
          "
          style={{
            height: "90px",
            transform: `translateX(-50%) translateY(-100%) rotate(${
              minute * 6
            }deg)`,
          }}
        />

        {/* Tâm đồng hồ */}
        <div
          className="
            absolute left-1/2 top-1/2 
            w-4 h-4 bg-cyan-500 rounded-full
            transform -translate-x-1/2 -translate-y-1/2
            shadow-md
          "
        />

        {/* Số */}
        {[...Array(12)].map((_, i) => {
          const displayHour = i + 1;
          const angle = displayHour * 30;
          const radius = 105;

          const disabled = isDisabledHour(displayHour, period);

          return (
            <div
              key={i}
              onClick={() => {
                if (!disabled) setHour(displayHour);
              }}
              className={`
                absolute text-[17px] font-semibold
                transition-all cursor-pointer select-none
                ${disabled ? "text-red-400 opacity-50 cursor-not-allowed" :
                  "hover:text-blue-600 hover:scale-110"
                }
                dark:text-gray-200
              `}
              style={{
                left: "50%",
                top: "50%",
                transform: `
                  translate(-50%, -50%)
                  rotate(${angle}deg)
                  translate(0, -${radius}px)
                  rotate(-${angle}deg)
                `,
              }}
            >
              {displayHour}
            </div>
          );
        })}
      </div>

      <p className="text-gray-500 dark:text-gray-300 text-sm mt-3">
        Kéo kim để chọn giờ & phút
      </p>
    </div>
  );
}
