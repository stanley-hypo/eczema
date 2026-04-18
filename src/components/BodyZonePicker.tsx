"use client";

import { useState } from "react";
import { BODY_ZONES, SUB_LOCATIONS, SYMPTOM_OPTIONS, type SymptomId } from "@/lib/body-data";
import { HandPalmDiagram, HandBackDiagram, FaceDiagram, FootSoleDiagram } from "@/components/BodyDiagrams";

export interface AffectedAreaData {
  bodyZone: string;
  subLocations: string[];
  severity: number;
  symptoms: string[];
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
    subLocations: [],
    severity: 5,
    symptoms: ["redness"],
    oozing: false, scaling: false, redness: true, swelling: false,
    notes: "",
  };
}

const symptomCategories = [
  { label: "常見症狀", ids: ["redness", "oozing", "scaling", "swelling", "blisters"] as SymptomId[] },
  { label: "皮膚質感", ids: ["dryness", "cracking", "thickening", "crusting"] as SymptomId[] },
  { label: "嚴重症狀", ids: ["hyperpigmentation", "bleeding"] as SymptomId[] },
];

export default function BodyZonePicker({ areas, onChange }: Props) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const toggleZone = (zoneId: string) => {
    const idx = areas.findIndex((a) => a.bodyZone === zoneId);
    if (idx >= 0) {
      onChange(areas.filter((_, i) => i !== idx));
      if (expandedZone === zoneId) setExpandedZone(null);
    } else {
      onChange([...areas, makeDefault(zoneId)]);
      setExpandedZone(zoneId);
    }
  };

  const updateArea = (zoneId: string, patch: Partial<AffectedAreaData>) => {
    onChange(areas.map((a) => (a.bodyZone === zoneId ? { ...a, ...patch } : a)));
  };

  const toggleSubLocation = (zoneId: string, subId: string) => {
    const area = areas.find((a) => a.bodyZone === zoneId);
    if (!area) return;
    const current = area.subLocations || [];
    const next = current.includes(subId)
      ? current.filter((s) => s !== subId)
      : [...current, subId];
    updateArea(zoneId, { subLocations: next });
  };

  const toggleSymptom = (zoneId: string, symptomId: string) => {
    const area = areas.find((a) => a.bodyZone === zoneId);
    if (!area) return;
    const current = area.symptoms || [];
    const next = current.includes(symptomId)
      ? current.filter((s) => s !== symptomId)
      : [...current, symptomId];
    updateArea(zoneId, {
      symptoms: next,
      oozing: next.includes("oozing"),
      scaling: next.includes("scaling"),
      redness: next.includes("redness"),
      swelling: next.includes("swelling"),
    });
  };

  const selectAllSubs = (zoneId: string) => {
    const subs = SUB_LOCATIONS[zoneId];
    if (subs) updateArea(zoneId, { subLocations: subs.map((s) => s.id) });
  };

  const clearAllSubs = (zoneId: string) => {
    updateArea(zoneId, { subLocations: [] });
  };

  const selectedZones = new Set(areas.map((a) => a.bodyZone));

  // Get the right diagram for a zone
  const getDiagram = (zoneId: string, selected: string[], onToggle: (id: string) => void) => {
    switch (zoneId) {
      case "left_hand":
      case "right_hand":
        return (
          <div className="flex gap-2 justify-center">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 mb-1">手板</p>
              <HandPalmDiagram selected={selected} onToggle={onToggle} />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 mb-1">手背</p>
              <HandBackDiagram selected={selected} onToggle={onToggle} />
            </div>
          </div>
        );
      case "left_foot":
      case "right_foot":
        return (
          <div className="text-center">
            <FootSoleDiagram selected={selected} onToggle={onToggle} />
          </div>
        );
      case "face":
        return (
          <div className="text-center">
            <FaceDiagram selected={selected} onToggle={onToggle} />
          </div>
        );
      default:
        return null;
    }
  };

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

      {/* Zone Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {BODY_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => toggleZone(zone.id)}
            className={`p-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 relative ${
              selectedZones.has(zone.id)
                ? "bg-indigo-100 border-2 border-indigo-400 text-indigo-700 shadow-sm"
                : "bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg block mb-0.5">{zone.emoji}</span>
            {zone.label}
            {selectedZones.has(zone.id) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Detail Panel for each selected zone */}
      {areas.map((area) => {
        const zone = BODY_ZONES.find((z) => z.id === area.bodyZone);
        const subs = SUB_LOCATIONS[area.bodyZone] || [];
        const isExpanded = expandedZone === area.bodyZone;
        const areaSymptoms = area.symptoms || [];
        const hasDiagram = ["left_hand", "right_hand", "left_foot", "right_foot", "face"].includes(area.bodyZone);

        return (
          <div key={area.bodyZone} className="bg-indigo-50/80 rounded-2xl border border-indigo-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedZone(isExpanded ? null : area.bodyZone)}
              className="w-full p-4 flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{zone?.emoji}</span>
                <span className="font-semibold text-sm text-gray-800">{zone?.label}</span>
                {area.subLocations?.length > 0 && (
                  <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                    {area.subLocations.length}個位置
                  </span>
                )}
                {areaSymptoms.length > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                    {areaSymptoms.length}個症狀
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-indigo-600">{area.severity}</span>
                <span className="text-[10px] text-gray-400">/10</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-4">
                {/* Severity */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-600">嚴重程度</span>
                    <span className="text-lg font-black text-indigo-600">{area.severity}/10</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={area.severity}
                    onChange={(e) => updateArea(area.bodyZone, { severity: parseInt(e.target.value) })}
                    className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    style={{ background: `linear-gradient(to right, #818cf8 ${(area.severity / 10) * 100}%, #e0e7ff ${(area.severity / 10) * 100}%)` }}
                  />
                </div>

                {/* Interactive Diagram or Sub-location buttons */}
                {hasDiagram ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">📍 撳圖選擇具體位置</span>
                      <button type="button" onClick={() => clearAllSubs(area.bodyZone)} className="text-[10px] text-gray-400 hover:underline">清除</button>
                    </div>
                    {getDiagram(area.bodyZone, area.subLocations || [], (subId) => toggleSubLocation(area.bodyZone, subId))}
                    {/* Show selected count */}
                    {(area.subLocations?.length || 0) > 0 && (
                      <p className="text-center text-xs text-indigo-600 font-medium">
                        已選 {area.subLocations.length} 個位置
                      </p>
                    )}
                  </div>
                ) : subs.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">📍 具體位置</span>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => selectAllSubs(area.bodyZone)} className="text-[10px] text-indigo-600 font-medium hover:underline">全選</button>
                        <button type="button" onClick={() => clearAllSubs(area.bodyZone)} className="text-[10px] text-gray-400 font-medium hover:underline">清除</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {subs.map((sub) => {
                        const isSelected = (area.subLocations || []).includes(sub.id);
                        return (
                          <button
                            key={sub.id} type="button"
                            onClick={() => toggleSubLocation(area.bodyZone, sub.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                              isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
                            }`}
                          >
                            {sub.emoji} {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Symptoms */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-gray-700">🔬 症狀</span>
                  {symptomCategories.map((cat) => {
                    const catSymptoms = SYMPTOM_OPTIONS.filter((s) => cat.ids.includes(s.id));
                    return (
                      <div key={cat.label} className="space-y-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">{cat.label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {catSymptoms.map((symptom) => (
                            <button
                              key={symptom.id} type="button"
                              onClick={() => toggleSymptom(area.bodyZone, symptom.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                                areaSymptoms.includes(symptom.id)
                                  ? symptom.category === "severe" ? "bg-red-500 text-white shadow-sm" : "bg-indigo-500 text-white shadow-sm"
                                  : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {symptom.emoji} {symptom.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <input
                  type="text" placeholder="備註（選填）" value={area.notes}
                  onChange={(e) => updateArea(area.bodyZone, { notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { BODY_ZONES };
