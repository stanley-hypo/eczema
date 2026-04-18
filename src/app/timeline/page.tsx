"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Log {
  id: string;
  logDate: string;
  overallSeverity: number | null;
  itchLevel: number | null;
  weatherTemp: number | null;
}

function severityColor(severity: number | null): string {
  if (!severity) return "bg-gray-100";
  if (severity <= 3) return "bg-green-200";
  if (severity <= 5) return "bg-yellow-200";
  if (severity <= 7) return "bg-orange-200";
  return "bg-red-200";
}

function severityEmoji(severity: number | null): string {
  if (!severity) return "⬜";
  if (severity <= 2) return "😊";
  if (severity <= 4) return "🙂";
  if (severity <= 6) return "😐";
  if (severity <= 8) return "😣";
  return "😰";
}

export default function TimelinePage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  const logMap = new Map(logs.map((l) => [l.logDate, l]));

  // Generate calendar days
  const [year, month] = currentMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const days: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push(dateStr);
  }

  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  // Calculate stats
  const monthLogs = logs.filter((l) => l.logDate.startsWith(currentMonth));
  const avgSeverity =
    monthLogs.length > 0
      ? (
          monthLogs.reduce((s, l) => s + (l.overallSeverity || 0), 0) /
          monthLogs.filter((l) => l.overallSeverity).length
        ).toFixed(1)
      : "-";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">📅 濕疹時間線</h1>
        <p className="text-gray-500 text-sm mt-1">追蹤你嘅濕疹變化</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{monthLogs.length}</p>
          <p className="text-xs text-gray-500">本月記錄</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{avgSeverity}</p>
          <p className="text-xs text-gray-500">平均嚴重程度</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <Link
            href={`/log/${today}`}
            className="text-2xl"
          >
            ➕
          </Link>
          <p className="text-xs text-gray-500">今日記錄</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 text-xl"
        >
          ◀️
        </button>
        <h2 className="text-lg font-semibold">
          {year} 年 {month} 月
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-gray-100 text-xl"
        >
          ▶️
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div
              key={d}
              className="text-center text-xs text-gray-400 font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dateStr, i) => {
            if (!dateStr) {
              return <div key={`empty-${i}`} />;
            }
            const log = logMap.get(dateStr);
            const dayNum = parseInt(dateStr.split("-")[2]);
            const isToday = dateStr === today;

            return (
              <Link
                key={dateStr}
                href={`/log/${dateStr}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 ${
                  isToday ? "ring-2 ring-indigo-400" : ""
                } ${severityColor(log?.overallSeverity ?? null)}`}
              >
                <span
                  className={`text-sm font-medium ${
                    log ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {dayNum}
                </span>
                <span className="text-xs">{severityEmoji(log?.overallSeverity ?? null)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 text-xs text-gray-500">
        <span>😊 輕微</span>
        <span>🙂 一般</span>
        <span>😐 中等</span>
        <span>😣 嚴重</span>
        <span>😰 極嚴重</span>
      </div>

      {/* Recent Logs List */}
      {monthLogs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">📋 近期記錄</h3>
          {monthLogs
            .sort((a, b) => b.logDate.localeCompare(a.logDate))
            .slice(0, 10)
            .map((log) => (
              <Link
                key={log.id}
                href={`/log/${log.logDate}`}
                className="block bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(log.logDate + "T00:00:00").toLocaleDateString(
                        "zh-HK",
                        { month: "short", day: "numeric", weekday: "short" }
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.weatherTemp ? `🌡️ ${log.weatherTemp}°C` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {severityEmoji(log.overallSeverity)}
                    </span>
                    {log.overallSeverity && (
                      <span className="text-sm font-bold text-gray-600">
                        {log.overallSeverity}/10
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
