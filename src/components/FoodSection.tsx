"use client";

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

function makeDefault(mealType: string): FoodEntryData {
  return { mealType, items: [], suspectTrigger: false, notes: "" };
}

export default function FoodSection({ foods, onChange }: Props) {
  const getFood = (mealType: string) => foods.find((f) => f.mealType === mealType);

  const setFood = (mealType: string, patch: Partial<FoodEntryData>) => {
    const exists = foods.find((f) => f.mealType === mealType);
    if (exists) {
      onChange(foods.map((f) => (f.mealType === mealType ? { ...f, ...patch } : f)));
    } else {
      onChange([...foods, { ...makeDefault(mealType), ...patch }]);
    }
  };

  const handleItemInput = (mealType: string, input: string) => {
    const items = input.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean);
    setFood(mealType, { items });
  };

  const getItemsText = (mealType: string) => {
    const food = getFood(mealType);
    return food ? food.items.join("，") : "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🍽️</span>
        <h2 className="text-lg font-bold text-gray-800">飲食記錄</h2>
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map(({ value, label, emoji, color }) => {
          const food = getFood(value);
          return (
            <div key={value} className={`${color} rounded-2xl p-4 space-y-2.5 border`}>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                  <span>{emoji}</span> {label}
                </h4>
                <button
                  type="button"
                  onClick={() => setFood(value, { suspectTrigger: !food?.suspectTrigger })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    food?.suspectTrigger
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  ⚠️ 懷疑致敏
                </button>
              </div>

              <input
                type="text"
                placeholder="輸入食物，用逗號分隔（例如：白飯，蒸魚，菜心）"
                value={getItemsText(value)}
                onChange={(e) => handleItemInput(value, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
