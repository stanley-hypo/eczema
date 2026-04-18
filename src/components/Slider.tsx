"use client";

import { useState } from "react";

interface SliderProps {
  label: string;
  value: number | null;
  onChange: (val: number | null) => void;
  min?: number;
  max?: number;
  emoji?: string;
}

export default function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  emoji = "📊",
}: SliderProps) {
  const display = value ?? "-";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {emoji} {label}
        </label>
        <span className="text-2xl font-bold text-indigo-600">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {min} {label.includes("嚴重") || label.includes("癢") ? "輕微" : "差"}
        </span>
        <span>
          {max} {label.includes("嚴重") || label.includes("癢") ? "極嚴重" : "好"}
        </span>
      </div>
    </div>
  );
}
