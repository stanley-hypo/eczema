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
  return {
    bodyZone: zone,
    severity: 5,
    oozing: false,
    scaling: false,
    redness: true,
    swelling: false,
    notes: "",
  };
}

export default function BodyZonePicker({ areas, onChange }: Props) {
  const toggleZone = (zoneId: string) => {
    const idx = areas.findIndex((a) => a.bodyZone === zoneId);
    if (idx >= 0) {
      onChange(areas.filter((_, i) => i !== idx));
    } else {
      onChange([...areas, makeDefault(zoneId)]);
    }
  };

  const updateArea = (zoneId: string, patch: Partial<AffectedAreaData>) => {
    onChange(
      areas.map((a) => (a.bodyZone === zoneId ? { ...a, ...patch } : a))
    );
  };

  const selectedZones = new Set(areas.map((a) => a.bodyZone));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🫧 患處位置</h3>

      {/* Zone grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {BODY_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => toggleZone(zone.id)}
            className={`p-2 rounded-xl text-sm font-medium transition-all ${
              selectedZones.has(zone.id)
                ? "bg-indigo-100 border-2 border-indigo-400 text-indigo-700 shadow-sm"
                : "bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{zone.emoji}</span>
            <br />
            {zone.label}
          </button>
        ))}
      </div>

      {/* Details for selected zones */}
      {areas.map((area) => {
        const zone = BODY_ZONES.find((z) => z.id === area.bodyZone);
        return (
          <div
            key={area.bodyZone}
            className="bg-indigo-50 rounded-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                {zone?.emoji} {zone?.label}
              </h4>
              <span className="text-lg font-bold text-indigo-600">
                {area.severity}/10
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={area.severity}
              onChange={(e) =>
                updateArea(area.bodyZone, {
                  severity: parseInt(e.target.value),
                })
              }
              className="w-full accent-indigo-600"
            />

            <div className="flex flex-wrap gap-2">
              {(["oozing", "scaling", "redness", "swelling"] as const).map(
                (symptom) => {
                  const labels = {
                    oozing: "滲水",
                    scaling: "脫皮",
                    redness: "紅腫",
                    swelling: "腫脹",
                  };
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() =>
                        updateArea(area.bodyZone, {
                          [symptom]: !area[symptom],
                        })
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        area[symptom]
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      {labels[symptom]}
                    </button>
                  );
                }
              )}
            </div>

            <input
              type="text"
              placeholder="備註（選填）"
              value={area.notes}
              onChange={(e) =>
                updateArea(area.bodyZone, { notes: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

export { BODY_ZONES };
