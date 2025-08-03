export interface DietMealFood {
  id: string;
  dietMealId: string;
  foodName: string;
  quantity: string;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  updatedAt: string;
}

export interface DietMeal {
  id: string;
  dietId: string;
  name: string;
  orderNumber: number;
  foods: DietMealFood[];
  createdAt: string;
  updatedAt: string;
}

export interface Diet {
  id: string;
  name: string;
  description?: string;
  userId: string;
  meals: DietMeal[];
  startDate?: string;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDietRequest {
  name: string;
  description?: string;
  startDate?: string;
  meals: {
    name: string;
    orderNumber: number;
    foods: {
      foodName: string;
      quantity: string;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
}

export interface UpdateDietRequest extends CreateDietRequest {
  id: string;
}

export interface DietFoodConsumption {
  id: string;
  userId: string;
  dietId: string;
  dietMealFoodId: string;
  consumptionDate: string;
  isConsumed: boolean;
  consumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionSummary {
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

export interface DailyProgress {
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  consumedCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  progressPercentage: number;
}