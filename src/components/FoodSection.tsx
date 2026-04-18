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
  { value: "breakfast", label: "🌅 早餐", color: "bg-yellow-50" },
  { value: "lunch", label: "☀️ 午餐", color: "bg-orange-50" },
  { value: "dinner", label: "🌙 晚餐", color: "bg-blue-50" },
  { value: "snack", label: "🍪 小食", color: "bg-green-50" },
];

function makeDefault(mealType: string): FoodEntryData {
  return { mealType, items: [], suspectTrigger: false, notes: "" };
}

export default function FoodSection({ foods, onChange }: Props) {
  const getFood = (mealType: string) => foods.find((f) => f.mealType === mealType);

  const ensureFood = (mealType: string): FoodEntryData => {
    return getFood(mealType) || makeDefault(mealType);
  };

  const setFood = (mealType: string, patch: Partial<FoodEntryData>) => {
    const exists = foods.find((f) => f.mealType === mealType);
    if (exists) {
      onChange(
        foods.map((f) => (f.mealType === mealType ? { ...f, ...patch } : f))
      );
    } else {
      onChange([...foods, { ...makeDefault(mealType), ...patch }]);
    }
  };

  const handleItemInput = (mealType: string, input: string) => {
    // Split by comma or newline
    const items = input
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setFood(mealType, { items });
  };

  const getItemsText = (mealType: string) => {
    const food = getFood(mealType);
    return food ? food.items.join("，") : "";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🍽️ 飲食記錄</h3>

      {MEAL_TYPES.map(({ value, label, color }) => {
        const food = getFood(value);
        return (
          <div key={value} className={`${color} rounded-xl p-4 space-y-2`}>
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{label}</h4>
              <button
                type="button"
                onClick={() =>
                  setFood(value, { suspectTrigger: !food?.suspectTrigger })
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  food?.suspectTrigger
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-400 border border-gray-200"
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
            />
          </div>
        );
      })}
    </div>
  );
}
