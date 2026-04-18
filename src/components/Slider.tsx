"use client";

interface SliderProps {
  label: string;
  value: number | null;
  onChange: (val: number | null) => void;
  min?: number;
  max?: number;
  emoji?: string;
}

const COLORS: Record<string, { low: string; high: string; bg: string; track: string }> = {
  "🔴": { low: "#10b981", high: "#ef4444", bg: "#fef2f2", track: "#fecaca" },
  "😣": { low: "#10b981", high: "#ef4444", bg: "#fef2f2", track: "#fecaca" },
  "😴": { low: "#ef4444", high: "#10b981", bg: "#f0fdf4", track: "#bbf7d0" },
  "😰": { low: "#10b981", high: "#ef4444", bg: "#fef2f2", track: "#fecaca" },
};

export default function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  emoji = "📊",
}: SliderProps) {
  const colors = COLORS[emoji] || { low: "#6366f1", high: "#6366f1", bg: "#eef2ff", track: "#c7d2fe" };
  const display = value ?? "-";
  const percentage = value ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
          <span className="text-base">{emoji}</span> {label}
        </label>
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-black text-indigo-600">{display}</span>
          <span className="text-xs text-gray-300">/{max}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? min}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${colors.low} 0%, ${colors.high} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-300 font-medium">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
