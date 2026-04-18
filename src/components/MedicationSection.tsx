"use client";

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
  { value: "cream", label: "🧴 藥膏", color: "bg-purple-50 border-purple-200" },
  { value: "ointment", label: "💊 軟膏", color: "bg-blue-50 border-blue-200" },
  { value: "lotion", label: "🫧 乳液", color: "bg-cyan-50 border-cyan-200" },
  { value: "oral", label: "💊 口服藥", color: "bg-orange-50 border-orange-200" },
  { value: "other", label: "❓ 其他", color: "bg-gray-50 border-gray-200" },
];

function makeDefault(): MedicationData {
  return { productName: "", type: "cream", bodyZones: [], timesApplied: 1, amount: "", notes: "" };
}

export default function MedicationSection({ medications, onChange }: Props) {
  const addMed = () => onChange([...medications, makeDefault()]);
  const removeMed = (idx: number) => onChange(medications.filter((_, i) => i !== idx));
  const updateMed = (idx: number, patch: Partial<MedicationData>) =>
    onChange(medications.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

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

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="產品名稱"
              value={med.productName}
              onChange={(e) => updateMed(idx, { productName: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
            />
            <select
              value={med.type}
              onChange={(e) => updateMed(idx, { type: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {MED_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 font-medium whitespace-nowrap">塗抹次數</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateMed(idx, { timesApplied: Math.max(1, med.timesApplied - 1) })}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-90 transition-all text-sm font-bold"
              >
                −
              </button>
              <span className="text-lg font-black text-purple-600 w-8 text-center">{med.timesApplied}</span>
              <button
                type="button"
                onClick={() => updateMed(idx, { timesApplied: med.timesApplied + 1 })}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-90 transition-all text-sm font-bold"
              >
                +
              </button>
            </div>
            <input
              type="text"
              placeholder="份量（例如：薄薄一層）"
              value={med.amount}
              onChange={(e) => updateMed(idx, { amount: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <input
            type="text"
            placeholder="備註（選填）"
            value={med.notes}
            onChange={(e) => updateMed(idx, { notes: e.target.value })}
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
