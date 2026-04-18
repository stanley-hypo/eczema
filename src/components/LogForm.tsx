"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Slider from "@/components/Slider";
import BodyZonePicker, {
  type AffectedAreaData,
  BODY_ZONES,
} from "@/components/BodyZonePicker";
import MedicationSection, {
  type MedicationData,
} from "@/components/MedicationSection";
import FoodSection, { type FoodEntryData } from "@/components/FoodSection";
import TriggerSection, { type TriggerData } from "@/components/TriggerSection";

interface Props {
  date: string;
}

export default function LogForm({ date }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  // Load existing log
  useEffect(() => {
    fetch(`/api/logs/${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setOverallSeverity(data.overallSeverity);
          setItchLevel(data.itchLevel);
          setSleepQuality(data.sleepQuality);
          setStressLevel(data.stressLevel);
          setNotes(data.notes || "");
          if (data.areas?.length)
            setAreas(
              data.areas.map((a: Record<string, unknown>) => ({
                bodyZone: a.bodyZone as string,
                severity: a.severity as number,
                oozing: a.oozing as boolean,
                scaling: a.scaling as boolean,
                redness: a.redness as boolean,
                swelling: a.swelling as boolean,
                notes: (a.notes as string) || "",
              }))
            );
          if (data.medications?.length) setMeds(data.medications);
          if (data.foods?.length) setFoods(data.foods);
          if (data.triggers?.length) setTriggerList(data.triggers);
        }
        setLoaded(true);
      });
  }, [date]);

  // Auto-fetch weather
  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          areas,
          meds,
          foods,
          triggerList,
        }),
      });
      if (res.ok) {
        router.push("/timeline");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">🔄</div>
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

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">📝 濕疹日記</h1>
        <p className="text-gray-500">{formatDate(date)}</p>
        {weather && (
          <p className="text-sm text-gray-400">
            🌡️ {weather.temperature_2m}°C · 💧 {weather.relative_humidity_2m}%
          </p>
        )}
      </div>

      {/* Overall Scores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
        <Slider
          label="整體嚴重程度"
          value={overallSeverity}
          onChange={setOverallSeverity}
          emoji="🔴"
        />
        <Slider
          label="癢度"
          value={itchLevel}
          onChange={setItchLevel}
          emoji="😣"
        />
        <Slider
          label="睡眠質素"
          value={sleepQuality}
          onChange={setSleepQuality}
          min={1}
          max={5}
          emoji="😴"
        />
        <Slider
          label="壓力指數"
          value={stressLevel}
          onChange={setStressLevel}
          min={1}
          max={5}
          emoji="😰"
        />
      </div>

      {/* Affected Areas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <BodyZonePicker areas={areas} onChange={setAreas} />
      </div>

      {/* Medications */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <MedicationSection medications={meds} onChange={setMeds} />
      </div>

      {/* Food */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <FoodSection foods={foods} onChange={setFoods} />
      </div>

      {/* Triggers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <TriggerSection triggers={triggerList} onChange={setTriggerList} />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2">
        <h3 className="text-lg font-semibold">📝 備註</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="任何想記低嘅嘢..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
        />
      </div>

      {/* Save Button (fixed bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100">
        <button
          onClick={save}
          disabled={saving}
          className="w-full max-w-lg mx-auto block py-3 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          }}
        >
          {saving ? "儲存中..." : "✅ 儲存記錄"}
        </button>
      </div>
    </div>
  );
}
