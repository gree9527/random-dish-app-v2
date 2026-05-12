export interface Dish {
  id: string;
  name: string;
  imagePath: string;
  thumbnailPath: string;
  steps: string[];
  createdAt: number;
  lastEatenAt?: number;
  category?: string[];
  rating?: number;
}

export interface DishInput {
  name: string;
  steps: string[];
  category?: string[];
  rating?: number;
}
