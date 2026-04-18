"use client";

export interface TriggerData {
  triggerType: string;
  description: string;
  severity: number;
}

interface Props {
  triggers: TriggerData[];
  onChange: (triggers: TriggerData[]) => void;
}

const TRIGGER_OPTIONS = [
  { value: "sweat", label: "出汗", emoji: "💦" },
  { value: "fabric", label: "衣物", emoji: "👔" },
  { value: "detergent", label: "洗衣液", emoji: "🧴" },
  { value: "pet", label: "寵物", emoji: "🐱" },
  { value: "dust", label: "灰塵", emoji: "💨" },
  { value: "pollen", label: "花粉", emoji: "🌸" },
  { value: "stress", label: "壓力", emoji: "😰" },
  { value: "heat", label: "炎熱", emoji: "🥵" },
  { value: "cold", label: "寒冷", emoji: "🥶" },
  { value: "chlorine", label: "泳池", emoji: "🏊" },
  { value: "other", label: "其他", emoji: "❓" },
];

function makeDefault(type: string): TriggerData {
  return { triggerType: type, description: "", severity: 3 };
}

export default function TriggerSection({ triggers, onChange }: Props) {
  const toggleTrigger = (type: string) => {
    const exists = triggers.find((t) => t.triggerType === type);
    if (exists) onChange(triggers.filter((t) => t.triggerType !== type));
    else onChange([...triggers, makeDefault(type)]);
  };

  const updateTrigger = (type: string, patch: Partial<TriggerData>) => {
    onChange(triggers.map((t) => (t.triggerType === type ? { ...t, ...patch } : t)));
  };

  const selectedTypes = new Set(triggers.map((t) => t.triggerType));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <h2 className="text-lg font-bold text-gray-800">可能誘因</h2>
        {triggers.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {triggers.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {TRIGGER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleTrigger(opt.value)}
            className={`p-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              selectedTypes.has(opt.value)
                ? "bg-amber-100 border-2 border-amber-400 text-amber-800 shadow-sm"
                : "bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg block mb-0.5">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {triggers.map((trigger) => {
        const opt = TRIGGER_OPTIONS.find((o) => o.value === trigger.triggerType);
        return (
          <div key={trigger.triggerType} className="bg-amber-50/80 rounded-2xl p-3 flex items-center gap-3 border border-amber-100">
            <span className="text-lg">{opt?.emoji}</span>
            <span className="text-sm font-semibold text-gray-700 min-w-[50px]">{opt?.label}</span>
            <input
              type="range"
              min={1}
              max={5}
              value={trigger.severity}
              onChange={(e) => updateTrigger(trigger.triggerType, { severity: parseInt(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-amber-500"
              style={{
                background: `linear-gradient(to right, #fbbf24 ${(trigger.severity / 5) * 100}%, #fef3c7 ${(trigger.severity / 5) * 100}%)`,
              }}
            />
            <span className="text-sm font-black text-amber-600 min-w-[32px] text-right">
              {trigger.severity}/5
            </span>
          </div>
        );
      })}
    </div>
  );
}
