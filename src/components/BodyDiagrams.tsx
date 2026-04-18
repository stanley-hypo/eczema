"use client";

import { type ReactNode } from "react";

interface RegionProps {
  d: string;
  selected: boolean;
  onClick: () => void;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export function Region({ d, selected, onClick, label, labelX, labelY }: RegionProps) {
  return (
    <g onClick={onClick} className="cursor-pointer">
      <path
        d={d}
        fill={selected ? "#818cf8" : "transparent"}
        stroke={selected ? "#4f46e5" : "#d1d5db"}
        strokeWidth={selected ? 2 : 1}
        className="transition-all duration-150"
        style={{ filter: selected ? "drop-shadow(0 0 4px rgba(99,102,241,0.4))" : "none" }}
      />
      {label && labelX && labelY && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          className="text-[8px] pointer-events-none select-none"
          fill={selected ? "#4f46e5" : "#9ca3af"}
          fontWeight={selected ? 700 : 400}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ── Hand Palm View ──
export function HandPalmDiagram({ selected, onToggle }: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 200 320" className="w-full max-w-[200px] mx-auto">
      {/* Wrist */}
      <Region d="M60,280 L80,280 L80,310 L60,310 Z" selected={selected.includes("wrist")} onClick={() => onToggle("wrist")} />
      <text x="70" y="300" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("wrist") ? "#4f46e5" : "#9ca3af"}>手腕</text>

      {/* Palm */}
      <Region d="M55,150 L145,150 L145,280 L55,280 Z" selected={selected.includes("palm")} onClick={() => onToggle("palm")} />
      <text x="100" y="220" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("palm") ? "#4f46e5" : "#9ca3af"}>手板</text>

      {/* Thumb */}
      <Region d="M25,130 L55,110 L65,170 L55,200 L25,180 Z" selected={selected.includes("thumb")} onClick={() => onToggle("thumb")} />
      <text x="38" y="160" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("thumb") ? "#4f46e5" : "#9ca3af"}>拇指</text>

      {/* Index finger */}
      <Region d="M60,30 L75,30 L80,150 L65,150 Z" selected={selected.includes("index_finger")} onClick={() => onToggle("index_finger")} />
      <text x="70" y="25" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("index_finger") ? "#4f46e5" : "#9ca3af"}>食指</text>

      {/* Middle finger */}
      <Region d="M80,20 L95,20 L98,150 L83,150 Z" selected={selected.includes("middle_finger")} onClick={() => onToggle("middle_finger")} />
      <text x="89" y="15" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("middle_finger") ? "#4f46e5" : "#9ca3af"}>中指</text>

      {/* Ring finger */}
      <Region d="M100,30 L115,30 L118,150 L103,150 Z" selected={selected.includes("ring_finger")} onClick={() => onToggle("ring_finger")} />
      <text x="109" y="25" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("ring_finger") ? "#4f46e5" : "#9ca3af"}>無名指</text>

      {/* Little finger */}
      <Region d="M120,55 L135,55 L140,150 L125,150 Z" selected={selected.includes("little_finger")} onClick={() => onToggle("little_finger")} />
      <text x="130" y="50" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("little_finger") ? "#4f46e5" : "#9ca3af"}>尾指</text>

      {/* Knuckles */}
      <Region d="M60,130 L140,130 L140,160 L60,160 Z" selected={selected.includes("knuckles")} onClick={() => onToggle("knuckles")} />
      <text x="100" y="148" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("knuckles") ? "#4f46e5" : "#9ca3af"}>指關節</text>

      {/* Finger tips overlay indicators */}
      {selected.includes("finger_tips") && (
        <>
          <circle cx="70" cy="32" r="5" fill="#818cf880" />
          <circle cx="89" cy="22" r="5" fill="#818cf880" />
          <circle cx="109" cy="32" r="5" fill="#818cf880" />
          <circle cx="130" cy="57" r="5" fill="#818cf880" />
        </>
      )}

      {/* Finger tips button */}
      <g onClick={() => onToggle("finger_tips")} className="cursor-pointer">
        <rect x="145" y="20" width="50" height="20" rx="4" fill={selected.includes("finger_tips") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("finger_tips") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="170" y="33" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("finger_tips") ? "#fff" : "#9ca3af"}>指尖</text>
      </g>

      {/* Between fingers button */}
      <g onClick={() => onToggle("between_fingers")} className="cursor-pointer">
        <rect x="145" y="45" width="50" height="20" rx="4" fill={selected.includes("between_fingers") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("between_fingers") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="170" y="58" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("between_fingers") ? "#fff" : "#9ca3af"}>手指縫</text>
      </g>
    </svg>
  );
}

// ── Hand Back View ──
export function HandBackDiagram({ selected, onToggle }: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 200 320" className="w-full max-w-[200px] mx-auto">
      <Region d="M60,280 L140,280 L140,310 L60,310 Z" selected={selected.includes("wrist")} onClick={() => onToggle("wrist")} />
      <text x="100" y="300" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("wrist") ? "#4f46e5" : "#9ca3af"}>手腕</text>

      <Region d="M55,150 L145,150 L145,280 L55,280 Z" selected={selected.includes("back_of_hand")} onClick={() => onToggle("back_of_hand")} />
      <text x="100" y="220" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("back_of_hand") ? "#4f46e5" : "#9ca3af"}>手背</text>

      <Region d="M25,130 L55,110 L65,170 L55,200 L25,180 Z" selected={selected.includes("thumb")} onClick={() => onToggle("thumb")} />
      <text x="38" y="160" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("thumb") ? "#4f46e5" : "#9ca3af"}>拇指</text>

      <Region d="M60,30 L75,30 L80,150 L65,150 Z" selected={selected.includes("index_finger")} onClick={() => onToggle("index_finger")} />
      <text x="70" y="25" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("index_finger") ? "#4f46e5" : "#9ca3af"}>食指</text>

      <Region d="M80,20 L95,20 L98,150 L83,150 Z" selected={selected.includes("middle_finger")} onClick={() => onToggle("middle_finger")} />
      <text x="89" y="15" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("middle_finger") ? "#4f46e5" : "#9ca3af"}>中指</text>

      <Region d="M100,30 L115,30 L118,150 L103,150 Z" selected={selected.includes("ring_finger")} onClick={() => onToggle("ring_finger")} />
      <text x="109" y="25" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("ring_finger") ? "#4f46e5" : "#9ca3af"}>無名指</text>

      <Region d="M120,55 L135,55 L140,150 L125,150 Z" selected={selected.includes("little_finger")} onClick={() => onToggle("little_finger")} />
      <text x="130" y="50" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("little_finger") ? "#4f46e5" : "#9ca3af"}>尾指</text>

      <Region d="M60,130 L140,130 L140,160 L60,160 Z" selected={selected.includes("knuckles")} onClick={() => onToggle("knuckles")} />
      <text x="100" y="148" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("knuckles") ? "#4f46e5" : "#9ca3af"}>指關節</text>

      {selected.includes("finger_tips") && (
        <>
          <circle cx="70" cy="32" r="5" fill="#818cf880" />
          <circle cx="89" cy="22" r="5" fill="#818cf880" />
          <circle cx="109" cy="32" r="5" fill="#818cf880" />
          <circle cx="130" cy="57" r="5" fill="#818cf880" />
        </>
      )}

      <g onClick={() => onToggle("finger_tips")} className="cursor-pointer">
        <rect x="145" y="20" width="50" height="20" rx="4" fill={selected.includes("finger_tips") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("finger_tips") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="170" y="33" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("finger_tips") ? "#fff" : "#9ca3af"}>指尖</text>
      </g>

      <g onClick={() => onToggle("between_fingers")} className="cursor-pointer">
        <rect x="145" y="45" width="50" height="20" rx="4" fill={selected.includes("between_fingers") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("between_fingers") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="170" y="58" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("between_fingers") ? "#fff" : "#9ca3af"}>手指縫</text>
      </g>
    </svg>
  );
}

// ── Face Diagram ──
export function FaceDiagram({ selected, onToggle }: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 240 300" className="w-full max-w-[220px] mx-auto">
      {/* Face outline */}
      <ellipse cx="120" cy="140" rx="85" ry="110" fill="transparent" stroke="#e5e7eb" strokeWidth={2} />

      {/* Forehead */}
      <Region d="M45,50 L195,50 L190,100 L50,100 Z" selected={selected.includes("forehead")} onClick={() => onToggle("forehead")} />
      <text x="120" y="78" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("forehead") ? "#4f46e5" : "#9ca3af"}>額頭</text>

      {/* Eyelids */}
      <Region d="M65,105 L105,105 L105,125 L65,125 Z" selected={selected.includes("eyelids")} onClick={() => onToggle("eyelids")} />
      <text x="85" y="118" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("eyelids") ? "#4f46e5" : "#9ca3af"}>眼皮</text>
      <Region d="M135,105 L175,105 L175,125 L135,125 Z" selected={selected.includes("eyelids")} onClick={() => onToggle("eyelids")} />

      {/* Nose */}
      <Region d="M105,120 L135,120 L140,170 L100,170 Z" selected={selected.includes("nose")} onClick={() => onToggle("nose")} />
      <text x="120" y="150" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("nose") ? "#4f46e5" : "#9ca3af"}>鼻</text>

      {/* Cheeks */}
      <Region d="M40,100 L95,110 L90,180 L45,175 Z" selected={selected.includes("cheeks")} onClick={() => onToggle("cheeks")} />
      <text x="65" y="148" textAnchor="middle" className="text-[8px] pointer-events-none" fill={selected.includes("cheeks") ? "#4f46e5" : "#9ca3af"}>面頰</text>
      <Region d="M145,110 L200,100 L195,175 L150,180 Z" selected={selected.includes("cheeks")} onClick={() => onToggle("cheeks")} />
      <text x="173" y="148" textAnchor="middle" className="text-[8px] pointer-events-none" fill={selected.includes("cheeks") ? "#4f46e5" : "#9ca3af"}>面頰</text>

      {/* Lips */}
      <Region d="M95,180 L145,180 L145,200 L95,200 Z" selected={selected.includes("lips")} onClick={() => onToggle("lips")} />
      <text x="120" y="194" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("lips") ? "#4f46e5" : "#9ca3af"}>嘴唇</text>

      {/* Chin */}
      <Region d="M85,200 L155,200 L150,240 L90,240 Z" selected={selected.includes("chin")} onClick={() => onToggle("chin")} />
      <text x="120" y="224" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("chin") ? "#4f46e5" : "#9ca3af"}>下巴</text>

      {/* Jawline */}
      <Region d="M35,170 L80,175 L85,220 L50,250 L35,240 Z" selected={selected.includes("jawline")} onClick={() => onToggle("jawline")} />
      <text x="58" y="215" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("jawline") ? "#4f46e5" : "#9ca3af"}>下顎</text>
      <Region d="M160,175 L205,170 L205,240 L190,250 L155,220 Z" selected={selected.includes("jawline")} onClick={() => onToggle("jawline")} />
      <text x="183" y="215" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("jawline") ? "#4f46e5" : "#9ca3af"}>下顎</text>

      {/* Around ears */}
      <Region d="M15,80 L40,90 L40,170 L15,170 Z" selected={selected.includes("around_ears")} onClick={() => onToggle("around_ears")} />
      <text x="28" y="135" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("around_ears") ? "#4f46e5" : "#9ca3af"} transform="rotate(-90 28 135)">耳後</text>
      <Region d="M200,90 L225,80 L225,170 L200,170 Z" selected={selected.includes("around_ears")} onClick={() => onToggle("around_ears")} />
      <text x="213" y="135" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("around_ears") ? "#4f46e5" : "#9ca3af"} transform="rotate(90 213 135)">耳後</text>
    </svg>
  );
}

// ── Foot Sole Diagram ──
export function FootSoleDiagram({ selected, onToggle }: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 200 340" className="w-full max-w-[160px] mx-auto">
      {/* Toes */}
      <Region d="M40,20 L90,10 L95,60 L45,65 Z" selected={selected.includes("toes")} onClick={() => onToggle("toes")} />
      <text x="67" y="45" textAnchor="middle" className="text-[8px] pointer-events-none" fill={selected.includes("toes") ? "#4f46e5" : "#9ca3af"}>腳趾</text>

      {/* Between toes */}
      <g onClick={() => onToggle("between_toes")} className="cursor-pointer">
        <rect x="110" y="15" width="50" height="20" rx="4" fill={selected.includes("between_toes") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("between_toes") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="135" y="28" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("between_toes") ? "#fff" : "#9ca3af"}>腳趾縫</text>
      </g>

      {/* Sole */}
      <Region d="M35,65 L105,60 L110,220 L30,220 Z" selected={selected.includes("sole")} onClick={() => onToggle("sole")} />
      <text x="68" y="145" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("sole") ? "#4f46e5" : "#9ca3af"}>腳板底</text>

      {/* Arch */}
      <Region d="M25,180 L55,170 L60,230 L25,230 Z" selected={selected.includes("arch")} onClick={() => onToggle("arch")} />
      <text x="42" y="205" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("arch") ? "#4f46e5" : "#9ca3af"}>腳拱</text>

      {/* Heel */}
      <Region d="M30,230 L110,230 L105,310 L35,310 Z" selected={selected.includes("heel")} onClick={() => onToggle("heel")} />
      <text x="68" y="275" textAnchor="middle" className="text-[9px] pointer-events-none" fill={selected.includes("heel") ? "#4f46e5" : "#9ca3af"}>腳踭</text>

      {/* Ankle */}
      <g onClick={() => onToggle("ankle")} className="cursor-pointer">
        <rect x="110" y="60" width="50" height="20" rx="4" fill={selected.includes("ankle") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("ankle") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="135" y="73" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("ankle") ? "#fff" : "#9ca3af"}>腳踝</text>
      </g>

      {/* Top of foot */}
      <g onClick={() => onToggle("top_of_foot")} className="cursor-pointer">
        <rect x="110" y="85" width="50" height="20" rx="4" fill={selected.includes("top_of_foot") ? "#818cf8" : "#f3f4f6"} stroke={selected.includes("top_of_foot") ? "#4f46e5" : "#d1d5db"} strokeWidth={1} />
        <text x="135" y="98" textAnchor="middle" className="text-[7px] pointer-events-none" fill={selected.includes("top_of_foot") ? "#fff" : "#9ca3af"}>腳面</text>
      </g>
    </svg>
  );
}

// ── Body Front Diagram ──
export function BodyFrontDiagram({ selectedZones, onToggleZone }: {
  selectedZones: string[];
  onToggleZone: (zone: string) => void;
}) {
  const zones = [
    { id: "scalp", d: "M90,10 L150,10 L155,40 L85,40 Z", label: "頭皮", lx: 120, ly: 30 },
    { id: "face", d: "M85,40 L155,40 L150,80 L90,80 Z", label: "面", lx: 120, ly: 64 },
    { id: "neck", d: "M95,80 L145,80 L145,100 L95,100 Z", label: "頸", lx: 120, ly: 93 },
    { id: "chest", d: "M70,100 L170,100 L165,170 L75,170 Z", label: "胸口", lx: 120, ly: 140 },
    { id: "left_arm", d: "M30,100 L70,100 L60,230 L25,230 Z", label: "左手", lx: 45, ly: 170 },
    { id: "right_arm", d: "M170,100 L210,100 L215,230 L180,230 Z", label: "右手", lx: 198, ly: 170 },
    { id: "left_hand", d: "M20,230 L65,230 L60,280 L25,280 Z", label: "左手掌", lx: 42, ly: 258 },
    { id: "right_hand", d: "M175,230 L220,230 L215,280 L180,280 Z", label: "右手掌", lx: 198, ly: 258 },
    { id: "abdomen", d: "M75,170 L165,170 L160,240 L80,240 Z", label: "肚", lx: 120, ly: 208 },
    { id: "groin", d: "M80,240 L160,240 L155,270 L85,270 Z", label: "腹股溝", lx: 120, ly: 258 },
    { id: "left_leg", d: "M80,270 L120,270 L115,400 L85,400 Z", label: "左腳", lx: 100, ly: 340 },
    { id: "right_leg", d: "M120,270 L160,270 L155,400 L125,400 Z", label: "右腳", lx: 140, ly: 340 },
    { id: "left_foot", d: "M80,400 L118,400 L115,430 L85,430 Z", label: "左腳掌", lx: 100, ly: 418 },
    { id: "right_foot", d: "M122,400 L160,400 L155,430 L125,430 Z", label: "右腳掌", lx: 140, ly: 418 },
  ];

  return (
    <svg viewBox="0 0 240 440" className="w-full max-w-[200px] mx-auto">
      {zones.map((z) => (
        <g key={z.id} onClick={() => onToggleZone(z.id)} className="cursor-pointer">
          <path
            d={z.d}
            fill={selectedZones.includes(z.id) ? "#818cf8" : "transparent"}
            stroke={selectedZones.includes(z.id) ? "#4f46e5" : "#d1d5db"}
            strokeWidth={selectedZones.includes(z.id) ? 2 : 1}
            className="transition-all duration-150"
          />
          <text
            x={z.lx} y={z.ly} textAnchor="middle"
            className="text-[7px] pointer-events-none"
            fill={selectedZones.includes(z.id) ? "#4f46e5" : "#9ca3af"}
            fontWeight={selectedZones.includes(z.id) ? 700 : 400}
          >
            {z.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Body Back Diagram ──
export function BodyBackDiagram({ selectedZones, onToggleZone }: {
  selectedZones: string[];
  onToggleZone: (zone: string) => void;
}) {
  const zones = [
    { id: "scalp", d: "M90,10 L150,10 L155,40 L85,40 Z", label: "頭皮", lx: 120, ly: 30 },
    { id: "ears", d: "M70,40 L85,40 L85,70 L75,70 Z", label: "耳", lx: 80, ly: 58 },
    { id: "ears_r", d: "M155,40 L170,40 L165,70 L155,70 Z", label: "耳", lx: 160, ly: 58 },
    { id: "neck", d: "M95,80 L145,80 L145,100 L95,100 Z", label: "頸後", lx: 120, ly: 93 },
    { id: "back", d: "M70,100 L170,100 L165,200 L75,200 Z", label: "背", lx: 120, ly: 155 },
    { id: "left_arm", d: "M30,100 L70,100 L60,230 L25,230 Z", label: "左手", lx: 45, ly: 170 },
    { id: "right_arm", d: "M170,100 L210,100 L215,230 L180,230 Z", label: "右手", lx: 198, ly: 170 },
    { id: "left_hand", d: "M20,230 L65,230 L60,280 L25,280 Z", label: "左手掌", lx: 42, ly: 258 },
    { id: "right_hand", d: "M175,230 L220,230 L215,280 L180,280 Z", label: "右手掌", lx: 198, ly: 258 },
    { id: "left_leg", d: "M80,200 L120,200 L115,400 L85,400 Z", label: "左腳", lx: 100, ly: 310 },
    { id: "right_leg", d: "M120,200 L160,200 L155,400 L125,400 Z", label: "右腳", lx: 140, ly: 310 },
    { id: "left_foot", d: "M80,400 L118,400 L115,430 L85,430 Z", label: "左腳掌", lx: 100, ly: 418 },
    { id: "right_foot", d: "M122,400 L160,400 L155,430 L125,430 Z", label: "右腳掌", lx: 140, ly: 418 },
  ];

  return (
    <svg viewBox="0 0 240 440" className="w-full max-w-[200px] mx-auto">
      {zones.map((z) => {
        const zoneId = z.id.replace("_r", "");
        const isSelected = selectedZones.includes(zoneId);
        return (
          <g key={z.id} onClick={() => onToggleZone(zoneId)} className="cursor-pointer">
            <path
              d={z.d}
              fill={isSelected ? "#818cf8" : "transparent"}
              stroke={isSelected ? "#4f46e5" : "#d1d5db"}
              strokeWidth={isSelected ? 2 : 1}
              className="transition-all duration-150"
            />
            <text
              x={z.lx} y={z.ly} textAnchor="middle"
              className="text-[7px] pointer-events-none"
              fill={isSelected ? "#4f46e5" : "#9ca3af"}
              fontWeight={isSelected ? 700 : 400}
            >
              {z.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
