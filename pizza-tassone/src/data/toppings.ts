import type { Topping } from '@/types';

export const TOPPINGS: Topping[] = [
  // Sauces
  { id: 'sauce-tomato',    name: 'Tomatensauce',    category: 'sauce',     priceExtra: 0,   isDefault: true,  emoji: '🍅' },
  { id: 'sauce-cream',     name: 'Sahnesauce',      category: 'sauce',     priceExtra: 50,  isDefault: false, emoji: '🥛' },
  { id: 'sauce-pesto',     name: 'Pesto',           category: 'sauce',     priceExtra: 80,  isDefault: false, emoji: '🌿' },

  // Cheese
  { id: 'cheese-mozzarella', name: 'Mozzarella',    category: 'cheese',    priceExtra: 0,   isDefault: true,  emoji: '🧀' },
  { id: 'cheese-gorgonzola', name: 'Gorgonzola',    category: 'cheese',    priceExtra: 100, isDefault: false, emoji: '🧀' },
  { id: 'cheese-parmesan',   name: 'Parmesan',      category: 'cheese',    priceExtra: 80,  isDefault: false, emoji: '🧀' },
  { id: 'cheese-extra',      name: 'Extra Käse',    category: 'cheese',    priceExtra: 100, isDefault: false, emoji: '🧀' },

  // Meat
  { id: 'meat-salami',       name: 'Salami',        category: 'meat',      priceExtra: 130, isDefault: false, emoji: '🍕' },
  { id: 'meat-prosciutto',   name: 'Schinken',      category: 'meat',      priceExtra: 130, isDefault: false, emoji: '🥩' },
  { id: 'meat-pepperoni',    name: 'Peperoni',      category: 'meat',      priceExtra: 130, isDefault: false, emoji: '🌶️' },
  { id: 'meat-chicken',      name: 'Hähnchen',      category: 'meat',      priceExtra: 150, isDefault: false, emoji: '🍗' },
  { id: 'meat-tuna',         name: 'Thunfisch',     category: 'meat',      priceExtra: 130, isDefault: false, emoji: '🐟' },
  { id: 'meat-anchovies',    name: 'Sardellen',     category: 'meat',      priceExtra: 130, isDefault: false, emoji: '🐟' },
  { id: 'meat-nduja',        name: 'Nduja',         category: 'meat',      priceExtra: 150, isDefault: false, emoji: '🌶️' },

  // Vegetables
  { id: 'veg-mushrooms',     name: 'Champignons',   category: 'vegetable', priceExtra: 100, isDefault: false, emoji: '🍄' },
  { id: 'veg-peppers',       name: 'Paprika',       category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🫑' },
  { id: 'veg-onions',        name: 'Zwiebeln',      category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🧅' },
  { id: 'veg-olives',        name: 'Oliven',        category: 'vegetable', priceExtra: 100, isDefault: false, emoji: '🫒' },
  { id: 'veg-artichokes',    name: 'Artischocken',  category: 'vegetable', priceExtra: 120, isDefault: false, emoji: '🌱' },
  { id: 'veg-spinach',       name: 'Spinat',        category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🥬' },
  { id: 'veg-corn',          name: 'Mais',          category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🌽' },
  { id: 'veg-arugula',       name: 'Rucola',        category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🌿' },
  { id: 'veg-capers',        name: 'Kapern',        category: 'vegetable', priceExtra: 80,  isDefault: false, emoji: '🫒' },
  { id: 'veg-sun-tomatoes',  name: 'Sonnenget. Tomaten', category: 'vegetable', priceExtra: 100, isDefault: false, emoji: '🍅' },

  // Extras
  { id: 'extra-basil',       name: 'Basilikum',     category: 'extra',     priceExtra: 0,   isDefault: false, emoji: '🌿' },
  { id: 'extra-chili',       name: 'Chili',         category: 'extra',     priceExtra: 0,   isDefault: false, emoji: '🌶️' },
  { id: 'extra-garlic',      name: 'Knoblauch',     category: 'extra',     priceExtra: 50,  isDefault: false, emoji: '🧄' },
  { id: 'extra-egg',         name: 'Ei',            category: 'extra',     priceExtra: 80,  isDefault: false, emoji: '🥚' },
];

export const getToppingById = (id: string): Topping | undefined =>
  TOPPINGS.find(t => t.id === id);

export const getToppingsByCategory = (category: Topping['category']): Topping[] =>
  TOPPINGS.filter(t => t.category === category);
