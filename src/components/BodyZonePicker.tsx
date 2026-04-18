"use client";

const BODY_ZONES = [
  { id: "face", label: "面", emoji: "😊" },
  { id: "neck", label: "頸", emoji: "🦒" },
  { id: "chest", label: "胸口", emoji: "👕" },
  { id: "back", label: "背", emoji: "🔙" },
  { id: "left_arm", label: "左手", emoji: "💪" },
  { id: "right_arm", label: "右手", emoji: "💪" },
  { id: "left_hand", label: "左手掌", emoji: "🤚" },
  { id: "right_hand", label: "右手掌", emoji: "🤚" },
  { id: "abdomen", label: "肚", emoji: "🫃" },
  { id: "left_leg", label: "左腳", emoji: "🦵" },
  { id: "right_leg", label: "右腳", emoji: "🦵" },
  { id: "left_foot", label: "左腳掌", emoji: "🦶" },
  { id: "right_foot", label: "右腳掌", emoji: "🦶" },
  { id: "scalp", label: "頭皮", emoji: "🧠" },
  { id: "ears", label: "耳", emoji: "👂" },
  { id: "groin", label: "腹股溝", emoji: "🔻" },
  { id: "elbows", label: "手踭", emoji: "💍" },
  { id: "knees", label: "膝頭", emoji: "🦿" },
] as const;

export interface AffectedAreaData {
  bodyZone: string;
  severity: number;
  oozing: boolean;
  scaling: boolean;
  redness: boolean;
  swelling: boolean;
  notes: string;
}

interface Props {
  areas: AffectedAreaData[];
  onChange: (areas: AffectedAreaData[]) => void;
}

function makeDefault(zone: string): AffectedAreaData {
  return { bodyZone: zone, severity: 5, oozing: false, scaling: false, redness: true, swelling: false, notes: "" };
}

export default function BodyZonePicker({ areas, onChange }: Props) {
  const toggleZone = (zoneId: string) => {
    const idx = areas.findIndex((a) => a.bodyZone === zoneId);
    if (idx >= 0) onChange(areas.filter((_, i) => i !== idx));
    else onChange([...areas, makeDefault(zoneId)]);
  };

  const updateArea = (zoneId: string, patch: Partial<AffectedAreaData>) => {
    onChange(areas.map((a) => (a.bodyZone === zoneId ? { ...a, ...patch } : a)));
  };

  const selectedZones = new Set(areas.map((a) => a.bodyZone));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🫧</span>
        <h2 className="text-lg font-bold text-gray-800">患處位置</h2>
        {areas.length > 0 && (
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {areas.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {BODY_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => toggleZone(zone.id)}
            className={`p-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              selectedZones.has(zone.id)
                ? "bg-indigo-100 border-2 border-indigo-400 text-indigo-700 shadow-sm"
                : "bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg block mb-0.5">{zone.emoji}</span>
            {zone.label}
          </button>
        ))}
      </div>

      {areas.map((area) => {
        const zone = BODY_ZONES.find((z) => z.id === area.bodyZone);
        return (
          <div key={area.bodyZone} className="bg-indigo-50/80 rounded-2xl p-4 space-y-3 border border-indigo-100">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-gray-800">
                {zone?.emoji} {zone?.label}
              </h4>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-indigo-600">{area.severity}</span>
                <span className="text-[10px] text-gray-400">/10</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={area.severity}
              onChange={(e) => updateArea(area.bodyZone, { severity: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
              style={{
                background: `linear-gradient(to right, #818cf8 ${(area.severity / 10) * 100}%, #e0e7ff ${(area.severity / 10) * 100}%)`,
              }}
            />

            <div className="flex flex-wrap gap-1.5">
              {(["oozing", "scaling", "redness", "swelling"] as const).map((symptom) => {
                const labels = { oozing: "💧 滲水", scaling: "🍂 脫皮", redness: "🔴 紅腫", swelling: "🫧 腫脹" };
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => updateArea(area.bodyZone, { [symptom]: !area[symptom] })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      area[symptom]
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {labels[symptom]}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="備註（選填）"
              value={area.notes}
              onChange={(e) => updateArea(area.bodyZone, { notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        );
      })}
    </div>
  );
}

export { BODY_ZONES };
