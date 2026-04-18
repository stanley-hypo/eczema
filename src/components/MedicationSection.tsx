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
  { value: "cream", label: "藥膏 (Cream)" },
  { value: "ointment", label: "軟膏 (Ointment)" },
  { value: "lotion", label: "乳液 (Lotion)" },
  { value: "oral", label: "口服藥" },
  { value: "other", label: "其他" },
];

function makeDefault(): MedicationData {
  return {
    productName: "",
    type: "cream",
    bodyZones: [],
    timesApplied: 1,
    amount: "",
    notes: "",
  };
}

export default function MedicationSection({ medications, onChange }: Props) {
  const addMed = () => onChange([...medications, makeDefault()]);

  const removeMed = (idx: number) =>
    onChange(medications.filter((_, i) => i !== idx));

  const updateMed = (idx: number, patch: Partial<MedicationData>) =>
    onChange(medications.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">💊 藥物 / 護膚品</h3>
        <button
          type="button"
          onClick={addMed}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 新增
        </button>
      </div>

      {medications.map((med, idx) => (
        <div
          key={idx}
          className="bg-purple-50 rounded-xl p-4 space-y-3 relative"
        >
          <button
            type="button"
            onClick={() => removeMed(idx)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
          >
            ✕
          </button>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="產品名稱"
              value={med.productName}
              onChange={(e) => updateMed(idx, { productName: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
            <select
              value={med.type}
              onChange={(e) => updateMed(idx, { type: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            >
              {MED_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">塗抹次數：</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateMed(idx, {
                    timesApplied: Math.max(1, med.timesApplied - 1),
                  })
                }
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
              >
                −
              </button>
              <span className="text-lg font-bold w-6 text-center">
                {med.timesApplied}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateMed(idx, { timesApplied: med.timesApplied + 1 })
                }
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <input
              type="text"
              placeholder="份量（例如：薄薄一層）"
              value={med.amount}
              onChange={(e) => updateMed(idx, { amount: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </div>

          <input
            type="text"
            placeholder="備註（選填）"
            value={med.notes}
            onChange={(e) => updateMed(idx, { notes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
      ))}

      {medications.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          未添加藥物，按「+ 新增」添加
        </p>
      )}
    </div>
  );
}
