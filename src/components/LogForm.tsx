"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Slider from "@/components/Slider";
import BodyZonePicker, { type AffectedAreaData } from "@/components/BodyZonePicker";
import MedicationSection, { type MedicationData } from "@/components/MedicationSection";
import FoodSection, { type FoodEntryData } from "@/components/FoodSection";
import TriggerSection, { type TriggerData } from "@/components/TriggerSection";

interface Props {
  date: string;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function LogForm({ date }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Main fields
  const [overallSeverity, setOverallSeverity] = useState<number | null>(null);
  const [itchLevel, setItchLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Nested
  const [areas, setAreas] = useState<AffectedAreaData[]>([]);
  const [meds, setMeds] = useState<MedicationData[]>([]);
  const [foods, setFoods] = useState<FoodEntryData[]>([]);
  const [triggerList, setTriggerList] = useState<TriggerData[]>([]);

  // Weather
  const [weather, setWeather] = useState<{
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  } | null>(null);

  const markChanged = useCallback(() => setHasChanges(true), []);

  // Load existing log or auto-fill from most recent
  useEffect(() => {
    const loadData = async () => {
      try {
        // First try loading today's existing log
        const res = await fetch(`/api/logs/${date}`);
        const data = await res.json();

        if (data && data.id) {
          // Existing log found — load it
          setOverallSeverity(data.overallSeverity);
          setItchLevel(data.itchLevel);
          setSleepQuality(data.sleepQuality);
          setStressLevel(data.stressLevel);
          setNotes(data.notes || "");
          if (data.areas?.length)
            setAreas(
              data.areas.map((a: Record<string, unknown>) => ({
                bodyZone: a.bodyZone as string,
                subLocations: (a.subLocations as string[]) || [],
                severity: a.severity as number,
                symptoms: (a.symptoms as string[]) || [],
                oozing: (a.oozing as boolean) ?? false,
                scaling: (a.scaling as boolean) ?? false,
                redness: (a.redness as boolean) ?? false,
                swelling: (a.swelling as boolean) ?? false,
                notes: (a.notes as string) || "",
              }))
            );
          if (data.medications?.length) {
            setMeds(
              data.medications.map((m: Record<string, unknown>) => ({
                productName: (m.productName as string) || "",
                type: (m.type as string) || "cream",
                bodyZones: (m.bodyZones as string[]) || [],
                timesApplied: (m.timesApplied as number) ?? 1,
                amount: (m.amount as string) || "",
                notes: (m.notes as string) || "",
              }))
            );
          }
          if (data.foods?.length) setFoods(data.foods);
          if (data.triggers?.length) setTriggerList(data.triggers);
          setLoaded(true);
          return;
        }

        // No existing log — auto-fill from most recent log
        const recentRes = await fetch("/api/logs?nested=true&limit=5");
        const recentLogs = await recentRes.json();

        if (Array.isArray(recentLogs) && recentLogs.length > 0) {
          const mostRecent = recentLogs.find((l: Record<string, unknown>) => (l.logDate as string) !== date);
          if (mostRecent) {
            // Auto-fill body zones and medications from most recent
            if (mostRecent.areas?.length) {
              setAreas(
                mostRecent.areas.map((a: Record<string, unknown>) => ({
                  bodyZone: a.bodyZone as string,
                  subLocations: (a.subLocations as string[]) || [],
                  severity: 5,
                  symptoms: [],
                  oozing: false,
                  scaling: false,
                  redness: false,
                  swelling: false,
                  notes: "",
                }))
              );
            }
            if (mostRecent.medications?.length) {
              setMeds(
                mostRecent.medications.map((m: Record<string, unknown>) => ({
                  productName: (m.productName as string) || "",
                  type: (m.type as string) || "cream",
                  bodyZones: (m.bodyZones as string[]) || [],
                  timesApplied: 1, // reset
                  amount: (m.amount as string) || "",
                  notes: "",
                }))
              );
            }
            if (mostRecent.triggers?.length) {
              setTriggerList(
                mostRecent.triggers.map((t: Record<string, unknown>) => ({
                  triggerType: (t.triggerType as string) || "",
                  description: "",
                  severity: 3,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, [date]);

  // Auto-fetch weather
  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => {});
  }, []);

  const save = async () => {
    if (saving) return; // prevent double-click
    setSaving(true);
    setSaveStatus("saving");
    try {
      const payload = {
        logDate: date,
        overallSeverity,
        itchLevel,
        sleepQuality,
        stressLevel,
        mood: null,
        notes,
        weatherTemp: weather?.temperature_2m ?? null,
        weatherHumidity: weather?.relative_humidity_2m ?? null,
        weatherDesc: weather?.weather_code?.toString() ?? null,
        areas: areas.map((a) => ({
          bodyZone: a.bodyZone,
          subLocations: a.subLocations || [],
          severity: a.severity,
          symptoms: a.symptoms || [],
          oozing: a.oozing || false,
          scaling: a.scaling || false,
          redness: a.redness || false,
          swelling: a.swelling || false,
          notes: a.notes || null,
        })),
        meds: meds.map((m) => ({
          productName: m.productName || "未命名",
          type: m.type || "cream",
          bodyZones: m.bodyZones || [],
          timesApplied: m.timesApplied || 1,
          amount: m.amount || null,
          notes: m.notes || null,
        })),
        foods: foods.filter((f) => f.items && f.items.length > 0).map((f) => ({
          mealType: f.mealType,
          items: f.items,
          suspectTrigger: f.suspectTrigger || false,
          notes: f.notes || null,
        })),
        triggerList: triggerList.map((t) => ({
          triggerType: t.triggerType,
          description: t.description || null,
          severity: t.severity || 3,
        })),
      };

      console.log("[LogForm] Saving payload:", JSON.stringify(payload).slice(0, 1000));

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[LogForm] Save response:", res.status, JSON.stringify(data));

      if (res.ok && data.success) {
        setSaveStatus("success");
        setHasChanges(false);
        // Use window.location for a hard redirect to avoid Next.js router issues
        setTimeout(() => {
          window.location.href = "/timeline";
        }, 1000);
      } else {
        console.error("[LogForm] Save failed:", res.status, data);
        setSaveStatus("error");
        alert("儲存失敗：" + (data.error || JSON.stringify(data)));
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    } catch (err) {
      console.error("[LogForm] Save error:", err);
      setSaveStatus("error");
      alert("網絡錯誤：" + String(err));
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("zh-HK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = date === new Date().toISOString().split("T")[0];

  const sections = [
    { id: "overview", label: "總覽", icon: "📊" },
    { id: "body", label: "患處", icon: "🫧" },
    { id: "medication", label: "藥物", icon: "💊" },
    { id: "food", label: "飲食", icon: "🍽️" },
    { id: "triggers", label: "誘因", icon: "⚡" },
  ];

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/timeline")}
            className="flex items-center gap-1 text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            返回
          </button>
          <h1 className="text-base font-bold text-gray-800">
            {isToday ? "📝 今日記錄" : "📝 編輯記錄"}
          </h1>
          <div className="w-16" /> {/* spacer */}
        </div>
        {/* Date & Weather */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">{formatDate(date)}</p>
          {weather && (
            <p className="text-xs text-gray-400">
              🌡️ {weather.temperature_2m}°C · 💧 {weather.relative_humidity_2m}%
            </p>
          )}
        </div>
        {/* Section Tabs */}
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success Toast */}
      {saveStatus === "success" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            儲存成功！
          </div>
        </div>
      )}

      {/* Error Toast */}
      {saveStatus === "error" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-medium">
            ❌ 儲存失敗，請重試
          </div>
        </div>
      )}

      {/* Auto-fill notice */}
      {loaded && (areas.length > 0 || meds.length > 0) && (
        <div className="mx-4 mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-sm">📋</span>
          <p className="text-xs text-indigo-600">
            已自動填入上次嘅患處同藥物，修改嚴重程度即可儲存
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Overview Section */}
        <div id="section-overview" className="scroll-mt-40">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-bold text-gray-800">整體狀況</h2>
            </div>
            <Slider
              label="整體嚴重程度"
              value={overallSeverity}
              onChange={(v) => { setOverallSeverity(v); markChanged(); }}
              emoji="🔴"
            />
            <Slider
              label="癢度"
              value={itchLevel}
              onChange={(v) => { setItchLevel(v); markChanged(); }}
              emoji="😣"
            />
            <Slider
              label="睡眠質素"
              value={sleepQuality}
              onChange={(v) => { setSleepQuality(v); markChanged(); }}
              min={1}
              max={5}
              emoji="😴"
            />
            <Slider
              label="壓力指數"
              value={stressLevel}
              onChange={(v) => { setStressLevel(v); markChanged(); }}
              min={1}
              max={5}
              emoji="😰"
            />
          </div>
        </div>

        {/* Body Section */}
        <div id="section-body" className="scroll-mt-40">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <BodyZonePicker areas={areas} onChange={(a) => { setAreas(a); markChanged(); }} />
          </div>
        </div>

        {/* Medication Section */}
        <div id="section-medication" className="scroll-mt-40">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <MedicationSection medications={meds} onChange={(m) => { setMeds(m); markChanged(); }} />
          </div>
        </div>

        {/* Food Section */}
        <div id="section-food" className="scroll-mt-40">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <FoodSection foods={foods} onChange={(f) => { setFoods(f); markChanged(); }} />
          </div>
        </div>

        {/* Triggers Section */}
        <div id="section-triggers" className="scroll-mt-40">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <TriggerSection triggers={triggerList} onChange={(t) => { setTriggerList(t); markChanged(); }} />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-bold text-gray-800">備註</h2>
          </div>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); markChanged(); }}
            placeholder="任何想記低嘅嘢..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => router.push("/timeline")}
            className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button
            onClick={save}
            disabled={saving}
            className={`flex-1 py-3 rounded-2xl font-semibold text-base transition-all shadow-md disabled:opacity-60 ${
              saveStatus === "success"
                ? "bg-green-500 text-white"
                : saveStatus === "error"
                ? "bg-red-500 text-white"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {saveStatus === "saving"
              ? "⏳ 儲存中..."
              : saveStatus === "success"
              ? "✅ 已儲存！"
              : saveStatus === "error"
              ? "❌ 重試"
              : "✅ 儲存記錄"}
          </button>
        </div>
      </div>
    </div>
  );
}
