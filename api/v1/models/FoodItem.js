import { toInt } from '../helpers/functions';

export const allFoodItems = [{ id: 1 }, { id: 2 }];

export class FoodItem {
  constructor(foodItem) {
    this.id = foodItem.id ? toInt(foodItem.id) : 0;
    this.name = foodItem.name ? foodItem.name.toString() : null;
    this.description = foodItem.description ? toInt(foodItem.description) : 0;
    this.quantity = foodItem.quantity ? toInt(foodItem.quantity) : 0;
    this.unitPrice = foodItem.unitPrice ? toInt(foodItem.unitPrice) : 0;
    this.updatedAt = foodItem.updatedAt || null;
    this.createdAt = foodItem.createdAt || null;
  }
}
