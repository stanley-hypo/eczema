"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, RequireAuth } from "@/components/AuthProvider";

interface Log {
  id: string;
  logDate: string;
  overallSeverity: number | null;
  itchLevel: number | null;
  weatherTemp: number | null;
  weatherHumidity: number | null;
}

function severityColor(severity: number | null): string {
  if (!severity) return "bg-gray-50 border-gray-100";
  if (severity <= 3) return "bg-emerald-50 border-emerald-200";
  if (severity <= 5) return "bg-amber-50 border-amber-200";
  if (severity <= 7) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

function severityEmoji(severity: number | null): string {
  if (!severity) return "⬜";
  if (severity <= 2) return "😊";
  if (severity <= 4) return "🙂";
  if (severity <= 6) return "😐";
  if (severity <= 8) return "😣";
  return "😰";
}

function severityLabel(severity: number | null): string {
  if (!severity) return "未記錄";
  if (severity <= 2) return "輕微";
  if (severity <= 4) return "一般";
  if (severity <= 6) return "中等";
  if (severity <= 8) return "嚴重";
  return "極嚴重";
}

function severityTextColor(severity: number | null): string {
  if (!severity) return "text-gray-400";
  if (severity <= 3) return "text-emerald-700";
  if (severity <= 5) return "text-amber-700";
  if (severity <= 7) return "text-orange-700";
  return "text-red-700";
}

export default function TimelinePage() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logMap = new Map(logs.map((l) => [l.logDate, l]));

  // Generate calendar days
  const [year, month] = currentMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay();
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
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  // Calculate stats
  const monthLogs = logs.filter((l) => l.logDate.startsWith(currentMonth));
  const severityLogs = monthLogs.filter((l) => l.overallSeverity);
  const avgSeverity =
    severityLogs.length > 0
      ? (severityLogs.reduce((s, l) => s + (l.overallSeverity || 0), 0) / severityLogs.length).toFixed(1)
      : "-";

  // Streak calculation
  const sortedDates = logs
    .map((l) => l.logDate)
    .sort()
    .reverse();
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🩺 濕疹日記</h1>
            <p className="text-xs text-gray-400 mt-0.5">追蹤你嘅濕疹變化</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/log/${today}`}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            + 記錄
          </Link>
          </div>
        </div>

        {/* User menu */}
        <div className="flex items-center justify-end gap-3 pb-1">
          {user?.role === "admin" && (
            <Link href="/admin" className="text-xs text-purple-500 hover:text-purple-700 font-medium">👑 管理</Link>
          )}
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">登出</button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-indigo-600">{monthLogs.length}</p>
            <p className="text-xs text-gray-400 mt-1">本月記錄</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-3xl font-bold ${avgSeverity !== "-" ? "text-purple-600" : "text-gray-300"}`}>
              {avgSeverity}
            </p>
            <p className="text-xs text-gray-400 mt-1">平均嚴重</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-3xl font-bold ${streak > 0 ? "text-emerald-600" : "text-gray-300"}`}>
              {streak}
            </p>
            <p className="text-xs text-gray-400 mt-1">連續記錄🔥</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-800">
            {year} 年 {month} 月
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} className="aspect-square" />;
              const log = logMap.get(dateStr);
              const dayNum = parseInt(dateStr.split("-")[2]);
              const isToday = dateStr === today;

              return (
                <Link
                  key={dateStr}
                  href={`/log/${dateStr}`}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 border-2 ${
                    isToday ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                  } ${severityColor(log?.overallSeverity ?? null)}`}
                >
                  <span className={`text-xs font-semibold ${log ? "text-gray-800" : "text-gray-400"}`}>
                    {dayNum}
                  </span>
                  <span className="text-[10px] mt-0.5">{severityEmoji(log?.overallSeverity ?? null)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" /> 輕微</span>
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" /> 一般</span>
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-orange-300 inline-block" /> 中等</span>
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> 嚴重</span>
        </div>

        {/* Recent Logs List */}
        {monthLogs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 text-base">📋 近期記錄</h3>
            <div className="space-y-2">
              {monthLogs
                .sort((a, b) => b.logDate.localeCompare(a.logDate))
                .slice(0, 14)
                .map((log) => (
                  <Link
                    key={log.id}
                    href={`/log/${log.logDate}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(log.logDate + "T00:00:00").toLocaleDateString("zh-HK", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${severityTextColor(log.overallSeverity)}`}>
                            {severityLabel(log.overallSeverity)}
                          </span>
                          {log.weatherTemp && (
                            <span className="text-xs text-gray-300">·</span>
                          )}
                          {log.weatherTemp && (
                            <span className="text-xs text-gray-400">🌡️ {log.weatherTemp}°C</span>
                          )}
                          {log.weatherHumidity && (
                            <span className="text-xs text-gray-400">💧 {log.weatherHumidity}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{severityEmoji(log.overallSeverity)}</span>
                        {log.overallSeverity && (
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-gray-700">{log.overallSeverity}</span>
                            <span className="text-[10px] text-gray-300">/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {monthLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 font-medium">呢個月仲未有記錄</p>
            <p className="text-gray-400 text-sm mt-1">撳右上角「+ 記錄」開始啦！</p>
            <Link
              href={`/log/${today}`}
              className="inline-block mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-md"
            >
              開始記錄 →
            </Link>
          </div>
        )}
      </div>
    </div>
    </RequireAuth>
  );
}
