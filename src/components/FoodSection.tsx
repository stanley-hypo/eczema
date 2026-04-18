"use client";

import { useState, useEffect, useRef } from "react";

export interface FoodEntryData {
  mealType: string;
  items: string[];
  suspectTrigger: boolean;
  notes: string;
}

interface Props {
  foods: FoodEntryData[];
  onChange: (foods: FoodEntryData[]) => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "早餐", emoji: "🌅", color: "bg-amber-50 border-amber-100" },
  { value: "lunch", label: "午餐", emoji: "☀️", color: "bg-orange-50 border-orange-100" },
  { value: "dinner", label: "晚餐", emoji: "🌙", color: "bg-indigo-50 border-indigo-100" },
  { value: "snack", label: "小食", emoji: "🍪", color: "bg-emerald-50 border-emerald-100" },
];

const COMMON_FOODS = [
  "白飯", "粥", "麵包", "意粉", "米粉", "河粉",
  "豬肉", "牛肉", "雞肉", "魚", "蝦", "蟹", "帶子",
  "豆腐", "雞蛋", "牛奶", "芝士", "牛油",
  "菜心", "生菜", "西蘭花", "紅蘿蔔", "番茄", "薯仔",
  "蘋果", "橙", "香蕉", "芒果", "士多啤梨",
  "咖啡", "奶茶", "豆漿", "果汁",
  "朱古力", "花生", "堅果", "餅乾", "蛋糕",
];

function makeDefault(mealType: string): FoodEntryData {
  return { mealType, items: [], suspectTrigger: false, notes: "" };
}

export default function FoodSection({ foods, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>(COMMON_FOODS);
  const [showPicker, setShowPicker] = useState<string | null>(null); // mealType
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetch("/api/suggestions?type=food")
      .then((r) => r.json())
      .then((data) => {
        if (data.foods?.length) {
          // Merge with defaults, user items first
          const merged = [...new Set([...data.foods, ...COMMON_FOODS])];
          setSuggestions(merged);
        }
      })
      .catch(() => {});
  }, []);

  const getFood = (mealType: string) => foods.find((f) => f.mealType === mealType);
  const getItems = (mealType: string) => getFood(mealType)?.items || [];

  const setFood = (mealType: string, patch: Partial<FoodEntryData>) => {
    const exists = foods.find((f) => f.mealType === mealType);
    if (exists) {
      onChange(foods.map((f) => (f.mealType === mealType ? { ...f, ...patch } : f)));
    } else {
      onChange([...foods, { ...makeDefault(mealType), ...patch }]);
    }
  };

  const toggleItem = (mealType: string, item: string) => {
    const current = getItems(mealType);
    const newItems = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFood(mealType, { items: newItems });
  };

  const addCustomItem = (mealType: string, text: string) => {
    const newItems = text.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean);
    if (newItems.length > 0) {
      const current = getItems(mealType);
      setFood(mealType, { items: [...new Set([...current, ...newItems])] });
      setFilterText("");
    }
  };

  const filteredSuggestions = (mealType: string) => {
    const currentItems = new Set(getItems(mealType));
    const available = suggestions.filter((s) => !currentItems.has(s));
    if (!filterText) return available.slice(0, 12);
    return available.filter((s) => s.toLowerCase().includes(filterText.toLowerCase())).slice(0, 12);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🍽️</span>
        <h2 className="text-lg font-bold text-gray-800">飲食記錄</h2>
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map(({ value, label, emoji, color }) => {
          const items = getItems(value);
          const food = getFood(value);
          const isPickerOpen = showPicker === value;

          return (
            <div key={value} className={`${color} rounded-2xl p-4 space-y-2.5 border`}>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                  <span>{emoji}</span> {label}
                  {items.length > 0 && (
                    <span className="bg-white/80 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {items.length}項
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFood(value, { suspectTrigger: !food?.suspectTrigger })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      food?.suspectTrigger
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-white text-gray-400 border border-gray-200"
                    }`}
                  >
                    ⚠️ 致敏
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPicker(isPickerOpen ? null : value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 active:scale-95 transition-all"
                  >
                    {isPickerOpen ? "收起" : "揀食物"}
                  </button>
                </div>
              </div>

              {/* Selected items as tags */}
              {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(value, item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 flex items-center gap-1 hover:border-red-200 hover:text-red-500 transition-all group"
                    >
                      {item}
                      <span className="text-gray-300 group-hover:text-red-400">✕</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Food Picker */}
              {isPickerOpen && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="搜尋或輸入新食物..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && filterText.trim()) {
                          e.preventDefault();
                          addCustomItem(value, filterText);
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    {filterText.trim() && (
                      <button
                        type="button"
                        onClick={() => addCustomItem(value, filterText)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold active:scale-95"
                      >
                        加入
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {filteredSuggestions(value).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleItem(value, s)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 active:scale-95 transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
