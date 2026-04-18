"use client";

import { useState, useEffect, useRef } from "react";

export interface MedicationData {
  productName: string;
  type: string;
  bodyZones: string[];
  timesApplied: number;
  amount: string;
  notes: string;
}

interface Props {
  medications: MedicationData[];
  onChange: (meds: MedicationData[]) => void;
}

const MED_TYPES = [
  { value: "cream", label: "🧴 藥膏" },
  { value: "ointment", label: "💊 軟膏" },
  { value: "lotion", label: "🫧 乳液" },
  { value: "oral", label: "💊 口服藥" },
  { value: "other", label: "❓ 其他" },
];

function makeDefault(): MedicationData {
  return { productName: "", type: "cream", bodyZones: [], timesApplied: 1, amount: "", notes: "" };
}

export default function MedicationSection({ medications, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null); // index
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/suggestions?type=medication")
      .then((r) => r.json())
      .then((data) => {
        if (data.medications) setSuggestions(data.medications);
      })
      .catch(() => {});
  }, []);

  const addMed = () => onChange([...medications, makeDefault()]);
  const removeMed = (idx: number) => onChange(medications.filter((_, i) => i !== idx));
  const updateMed = (idx: number, patch: Partial<MedicationData>) =>
    onChange(medications.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  const filteredSuggestions = (idx: number) => {
    const input = medications[idx]?.productName?.toLowerCase() || "";
    if (!input) return suggestions.slice(0, 8);
    return suggestions.filter((s) => s.toLowerCase().includes(input)).slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h2 className="text-lg font-bold text-gray-800">藥物 / 護膚品</h2>
          {medications.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {medications.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={addMed}
          className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
        >
          + 新增
        </button>
      </div>

      {medications.map((med, idx) => (
        <div key={idx} className="bg-purple-50/50 rounded-2xl p-4 space-y-3 border border-purple-100 relative">
          <button
            type="button"
            onClick={() => removeMed(idx)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 text-xs transition-colors"
          >
            ✕
          </button>

          {/* Product name with autocomplete */}
          <div className="relative">
            <input
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              placeholder="產品名稱（開始輸入或揀歷史記錄）"
              value={med.productName}
              onChange={(e) => updateMed(idx, { productName: e.target.value })}
              onFocus={() => setShowSuggestions(idx)}
              onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
            />
            {showSuggestions === idx && filteredSuggestions(idx).length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredSuggestions(idx).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      updateMed(idx, { productName: suggestion });
                      setShowSuggestions(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <span className="text-purple-400">💊</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={med.type}
              onChange={(e) => updateMed(idx, { type: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {MED_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 font-medium">次數</label>
              <button
                type="button"
                onClick={() => updateMed(idx, { timesApplied: Math.max(1, med.timesApplied - 1) })}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 active:scale-90 text-sm font-bold"
              >
                −
              </button>
              <span className="text-lg font-black text-purple-600 w-8 text-center">{med.timesApplied}</span>
              <button
                type="button"
                onClick={() => updateMed(idx, { timesApplied: med.timesApplied + 1 })}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 active:scale-90 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="份量（例如：薄薄一層）"
            value={med.amount}
            onChange={(e) => updateMed(idx, { amount: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      ))}

      {medications.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-2xl mb-1">💊</p>
          <p className="text-gray-400 text-sm">未添加藥物</p>
          <p className="text-gray-300 text-xs mt-0.5">按「+ 新增」添加</p>
        </div>
      )}
    </div>
  );
}
