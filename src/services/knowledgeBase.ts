// ─── Structured Offer Shape ─────────────────────────────────────────────────
export interface StructuredOffer {
  productName: string;
  originalPrice: number;
  discountPrice: number;
  tag: string;
  savings: number;
  color: string;
}

export interface Offer {
  keywords: string[];
  response: string;
  structuredOffers: StructuredOffer[];
}

// ─── OFFERS ─────────────────────────────────────────────────────────────────
export const OFFERS: Offer[] = [
  {
    keywords: ['discount', 'offer', 'soft drink', 'cola', 'soda', 'beverages'],
    response: '🥤 Amazing beverage deal today! Buy one Cola Soda 6-pack and get one FREE!',
    structuredOffers: [
      { productName: 'Cola Soda (6pk)', originalPrice: 439, discountPrice: 220, tag: 'BUY 1 GET 1', savings: 219, color: '#dc2626' },
    ],
  },
  {
    keywords: ['healthy', 'snack', 'nuts', 'alternative'],
    response: '🥜 Looking for healthier snack options? Check out these deals!',
    structuredOffers: [
      { productName: 'Mixed Nuts Bag', originalPrice: 479, discountPrice: 399, tag: '15% OFF', savings: 80, color: '#b45309' },
      { productName: 'Granola Bars (Oat & Honey)', originalPrice: 279, discountPrice: 239, tag: '15% OFF', savings: 40, color: '#d97706' },
    ],
  },
  {
    keywords: ['coffee', 'cheap', 'beans'],
    response: '☕ Great news for coffee lovers! Our premium Dark Roast Coffee Beans are ₹320 off today!',
    structuredOffers: [
      { productName: 'Dark Roast Coffee Beans', originalPrice: 1039, discountPrice: 719, tag: '₹320 OFF', savings: 320, color: '#451a03' },
    ],
  },
  {
    keywords: ['cookies', 'bakery', 'sweet'],
    response: '🍪 Fresh bakery items are on a sweet discount right now!',
    structuredOffers: [
      { productName: 'Chocolate Chip Cookies', originalPrice: 239, discountPrice: 191, tag: '20% OFF', savings: 48, color: '#854d0e' },
      { productName: 'Butter Croissants', originalPrice: 343, discountPrice: 274, tag: '20% OFF', savings: 69, color: '#eab308' },
    ],
  },
  {
    keywords: ['water', 'hydration', 'combo'],
    response: '💧 Stay hydrated with our combo deal on Spring Water 24-packs!',
    structuredOffers: [
      { productName: 'Spring Water (24pk)', originalPrice: 391, discountPrice: 299, tag: 'COMBO DEAL', savings: 92, color: '#3b82f6' },
    ],
  },
  {
    keywords: ['eggs', 'organic', 'protein'],
    response: '🥚 Farm-fresh Organic Brown Eggs are ₹50 off today!',
    structuredOffers: [
      { productName: 'Organic Brown Eggs', originalPrice: 399, discountPrice: 349, tag: '₹50 OFF', savings: 50, color: '#b45309' },
    ],
  },
  {
    keywords: ['yogurt', 'healthy', 'protein'],
    response: '🥛 Our creamy Greek Yogurt is 20% off — perfect for a healthy breakfast!',
    structuredOffers: [
      { productName: 'Greek Yogurt (32oz)', originalPrice: 311, discountPrice: 249, tag: '20% OFF', savings: 62, color: '#6366f1' },
    ],
  },
  {
    keywords: ['bread', 'fresh', 'bakery'],
    response: '🍞 Freshly baked Sourdough Bread is ₹80 off today!',
    structuredOffers: [
      { productName: 'Sourdough Bread', originalPrice: 279, discountPrice: 199, tag: '₹80 OFF', savings: 80, color: '#ca8a04' },
    ],
  },
];

// ─── GENERAL OFFERS (Top 5 most attractive) ─────────────────────────────────
export const GENERAL_OFFERS: StructuredOffer[] = [
  { productName: 'Cola Soda (6pk)', originalPrice: 439, discountPrice: 220, tag: 'BUY 1 GET 1', savings: 219, color: '#dc2626' },
  { productName: 'Dark Roast Coffee Beans', originalPrice: 1039, discountPrice: 719, tag: '₹320 OFF', savings: 320, color: '#451a03' },
  { productName: 'Spring Water (24pk)', originalPrice: 391, discountPrice: 299, tag: 'COMBO DEAL', savings: 92, color: '#3b82f6' },
  { productName: 'Sourdough Bread', originalPrice: 279, discountPrice: 199, tag: '₹80 OFF', savings: 80, color: '#ca8a04' },
  { productName: 'Chocolate Chip Cookies', originalPrice: 239, discountPrice: 191, tag: '20% OFF', savings: 48, color: '#854d0e' },
];

// ─── SYNONYMS ───────────────────────────────────────────────────────────────
export const SYNONYMS: Record<string, string[]> = {
  milk: ['dairy', 'toned milk', 'whole milk', 'almond milk', 'lactose-free', 'full cream', 'low-fat'],
  bread: ['loaf', 'bakery', 'sourdough', 'wheat bread', 'roti'],
  vegetables: ['veggies', 'greens', 'sabzi'],
  drinks: ['beverages', 'soda', 'cola', 'water', 'juice', 'soft drink'],
  chips: ['potato chips', 'tortilla chips', 'crisps'],
  chocolate: ['cocoa', 'dark chocolate', 'candy'],
  rice: ['basmati', 'biryani rice'],
  eggs: ['anda', 'protein'],
  butter: ['margarine', 'ghee'],
  coffee: ['espresso', 'cappuccino', 'latte'],
  tea: ['chai', 'green tea'],
  fruit: ['fruits', 'fresh fruit', 'phal'],
  yogurt: ['dahi', 'curd'],
  cheese: ['paneer'],
};

// ─── MARKET BASKET ──────────────────────────────────────────────────────────
export const MARKET_BASKET: Record<
  string,
  { boughtTogether: string[]; similar: string[]; healthier?: string[] }
> = {
  // Bread
  'Sourdough Bread': {
    boughtTogether: ['Unsalted Butter', 'Cream Cheese', 'Organic Brown Eggs'],
    similar: ['Whole Wheat Bread', 'Bagels (Plain 6pk)'],
    healthier: ['Whole Wheat Bread'],
  },
  // Milk
  'Whole Milk': {
    boughtTogether: ['Chocolate Chip Cookies', 'Chocolate Muffins', 'Dark Roast Coffee Beans'],
    similar: ['Almond Milk (Unsweetened)', 'Sour Cream'],
    healthier: ['Almond Milk (Unsweetened)'],
  },
  // Chips
  'Potato Chips (Classic)': {
    boughtTogether: ['Cola Soda (6pk)', 'Tortilla Chips', 'Popcorn (Butter)'],
    similar: ['Tortilla Chips', 'Pretzels (Twists)', 'Popcorn (Butter)'],
    healthier: ['Mixed Nuts Bag', 'Granola Bars (Oat & Honey)'],
  },
  // Coffee
  'Dark Roast Coffee Beans': {
    boughtTogether: ['Whole Milk', 'Butter Croissants', 'Bagels (Plain 6pk)'],
    similar: ['Green Tea (12pk)', 'Energy Drink (4pk)'],
    healthier: ['Green Tea (12pk)'],
  },
  // Apples
  'Red Apples': {
    boughtTogether: ['Bananas', 'Oranges', 'Strawberries'],
    similar: ['Peaches', 'Green Grapes'],
    healthier: ['Blueberries', 'Strawberries'],
  },
  // Eggs
  'Organic Brown Eggs': {
    boughtTogether: ['Unsalted Butter', 'Whole Milk', 'Sourdough Bread'],
    similar: ['Greek Yogurt (32oz)', 'Cream Cheese'],
    healthier: ['Greek Yogurt (32oz)'],
  },
  // Yogurt
  'Greek Yogurt (32oz)': {
    boughtTogether: ['Blueberries', 'Strawberries', 'Granola Bars (Oat & Honey)'],
    similar: ['Sour Cream', 'Cream Cheese'],
    healthier: ['Blueberries'],
  },
  // Cheese
  'Cheddar Cheese Block': {
    boughtTogether: ['Sourdough Bread', 'Roma Tomatoes', 'Butter Croissants'],
    similar: ['Cream Cheese', 'Sour Cream'],
  },
  // Butter
  'Unsalted Butter': {
    boughtTogether: ['Sourdough Bread', 'Organic Brown Eggs', 'Whole Wheat Bread'],
    similar: ['Cream Cheese', 'Sour Cream'],
  },
  // Chocolate
  'Chocolate Bar (Dark)': {
    boughtTogether: ['Whole Milk', 'Chocolate Muffins', 'Chocolate Chip Cookies'],
    similar: ['Gummy Bears', 'Chocolate Muffins'],
    healthier: ['Mixed Nuts Bag', 'Granola Bars (Oat & Honey)'],
  },
  // Cookies
  'Chocolate Chip Cookies': {
    boughtTogether: ['Whole Milk', 'Chocolate Bar (Dark)', 'Chocolate Muffins'],
    similar: ['Cinnamon Rolls', 'Chocolate Muffins'],
    healthier: ['Granola Bars (Oat & Honey)'],
  },
  // Juice
  'Organic Orange Juice': {
    boughtTogether: ['Bananas', 'Granola Bars (Oat & Honey)', 'Bagels (Plain 6pk)'],
    similar: ['Apple Cider', 'Green Tea (12pk)'],
    healthier: ['Green Tea (12pk)'],
  },
  // Tea
  'Green Tea (12pk)': {
    boughtTogether: ['Granola Bars (Oat & Honey)', 'Red Apples', 'Blueberries'],
    similar: ['Dark Roast Coffee Beans', 'Sparkling Water (Lemon 12pk)'],
  },
  // Water
  'Spring Water (24pk)': {
    boughtTogether: ['Potato Chips (Classic)', 'Mixed Nuts Bag', 'Granola Bars (Oat & Honey)'],
    similar: ['Sparkling Water (Lemon 12pk)', 'Green Tea (12pk)'],
  },
  // Vegetables
  'Carrots': {
    boughtTogether: ['Broccoli Crown', 'Spinach Bag', 'Red Onions'],
    similar: ['Cucumber', 'Bell Pepper Mix'],
    healthier: ['Spinach Bag', 'Broccoli Crown'],
  },
  // Snacks
  'Mixed Nuts Bag': {
    boughtTogether: ['Granola Bars (Oat & Honey)', 'Blueberries', 'Green Tea (12pk)'],
    similar: ['Pretzels (Twists)', 'Popcorn (Butter)'],
  },
  // Bananas
  'Bananas': {
    boughtTogether: ['Whole Milk', 'Strawberries', 'Greek Yogurt (32oz)'],
    similar: ['Red Apples', 'Peaches', 'Oranges'],
  },
  // Croissants
  'Butter Croissants': {
    boughtTogether: ['Dark Roast Coffee Beans', 'Cream Cheese', 'Unsalted Butter'],
    similar: ['Bagels (Plain 6pk)', 'Cinnamon Rolls'],
  },
  // Tortilla chips
  'Tortilla Chips': {
    boughtTogether: ['Cola Soda (6pk)', 'Potato Chips (Classic)', 'Roma Tomatoes'],
    similar: ['Potato Chips (Classic)', 'Pretzels (Twists)'],
    healthier: ['Mixed Nuts Bag'],
  },
};

// ─── STORE INFO ─────────────────────────────────────────────────────────────
export interface StoreInfoEntry {
  keywords: string[];
  response: string;
}

export const STORE_INFO: StoreInfoEntry[] = [
  {
    keywords: ['store', 'about the store', 'store info', 'store details'],
    response: 'Welcome to our Supermarket! We offer fresh produce, daily essentials, and a seamless smart shopping experience. We are open from 8:00 AM to 10:00 PM, seven days a week. Let me know if you need help finding anything!',
  },
  {
    keywords: ['close', 'time', 'open', 'hours', 'timing'],
    response: 'The store is open from 8:00 AM to 10:00 PM, seven days a week.',
  },
  {
    keywords: ['customer service', 'help desk', 'information'],
    response: 'Customer service is located right near the entrance on your left as you walk in.',
  },
  {
    keywords: ['billing', 'counter', 'pay', 'checkout', 'payment', 'bill'],
    response: 'The billing counters are located at the front of the store, near the exit.',
  },
  {
    keywords: ['exit', 'door', 'leave', 'out'],
    response: 'The main exit is located at the front of the store, just past the billing counters.',
  },
  {
    keywords: ['cart', 'trolley', 'basket', 'bags'],
    response: 'Shopping carts and baskets are available right at the entrance of the store.',
  },
  {
    keywords: ['restroom', 'toilet', 'washroom', 'bathroom'],
    response: 'The restrooms are located at the back of the store, past the Dairy section.',
  },
  {
    keywords: ['parking', 'car', 'park', 'vehicle'],
    response: 'We have basement parking with over 200 spots. Take the elevator or stairs near the entrance.',
  },
  {
    keywords: ['return', 'exchange', 'refund', 'policy'],
    response: 'We accept returns within 7 days of purchase with a valid receipt. Head to customer service near the entrance for assistance.',
  },
  {
    keywords: ['membership', 'loyalty', 'member', 'card', 'reward'],
    response: 'You can sign up for our loyalty card at the customer service desk near the entrance. Members earn points on every purchase!',
  },
  {
    keywords: ['delivery', 'shipping', 'online', 'app', 'deliver'],
    response: 'We offer same-day delivery through our mobile app! Download it today to get your groceries delivered to your door.',
  },
  {
    keywords: ['pay', 'credit', 'cash', 'card', 'apple pay', 'payment', 'method'],
    response: 'We accept Cash, Credit/Debit cards, Apple Pay, and Google Pay at all billing counters.',
  },
];

// ─── RECIPES ────────────────────────────────────────────────────────────────
export const RECIPES: Record<string, string[]> = {
  cake: ['Whole Milk', 'Organic Brown Eggs', 'Unsalted Butter', 'Chocolate Bar (Dark)', 'Strawberries'],
  baking: ['Whole Milk', 'Organic Brown Eggs', 'Unsalted Butter', 'Chocolate Bar (Dark)'],
  pizza: ['Roma Tomatoes', 'Cheddar Cheese Block', 'Bell Pepper Mix', 'Red Onions'],
  salad: ['Spinach Bag', 'Cucumber', 'Carrots', 'Roma Tomatoes', 'Red Onions'],
  sandwich: ['Whole Wheat Bread', 'Cheddar Cheese Block', 'Roma Tomatoes', 'Cucumber'],
  guacamole: ['Red Onions', 'Roma Tomatoes', 'Tortilla Chips'],
  smoothie: ['Bananas', 'Strawberries', 'Greek Yogurt (32oz)', 'Almond Milk (Unsweetened)'],
  breakfast: ['Organic Brown Eggs', 'Sourdough Bread', 'Unsalted Butter', 'Organic Orange Juice'],
};

// ─── RACK INFO ──────────────────────────────────────────────────────────────
export interface RackNavInfo {
  aisle: string;
  section: string;
  distance: string;
  steps: string;
}

export const RACK_INFO: Record<string, RackNavInfo> = {
  A1: { aisle: 'Aisle 1', section: 'Fruits Section', distance: '~15m', steps: '~20 steps' },
  A2: { aisle: 'Aisle 2', section: 'Vegetables Section', distance: '~20m', steps: '~26 steps' },
  B1: { aisle: 'Aisle 3', section: 'Dairy Section', distance: '~30m', steps: '~40 steps' },
  B2: { aisle: 'Aisle 4', section: 'Bakery Section', distance: '~35m', steps: '~46 steps' },
  C1: { aisle: 'Aisle 5', section: 'Snacks Section', distance: '~40m', steps: '~52 steps' },
  C2: { aisle: 'Aisle 6', section: 'Beverages Section', distance: '~45m', steps: '~59 steps' },
};

// ─── GREETINGS ──────────────────────────────────────────────────────────────
export const GREETINGS: Record<string, string[]> = {
  hi: [
    "Hello there! 👋 Welcome to our supermarket. How can I help you today?",
    "Hey! Great to see you. I'm your AI Shopping Assistant — ask me anything!",
    "Hi! 😊 Ready to help you shop. What are you looking for today?",
    "Hello! I'm here to make your shopping experience smooth and easy. What do you need?",
  ],
  hello: [
    "Hello there! 👋 Welcome to our supermarket. How can I help you today?",
    "Hey! Great to see you. I'm your AI Shopping Assistant — ask me anything!",
    "Hi! 😊 Ready to help you shop. What are you looking for today?",
    "Hello! I'm here to make your shopping experience smooth and easy. What do you need?",
  ],
  hey: [
    "Hey there! 😄 What can I help you find today?",
    "Hey! Welcome! Looking for something specific or just browsing?",
    "Hey! I'm your supermarket buddy. Ask me anything!",
  ],
  'good morning': [
    "Good morning! ☀️ Fresh produce just arrived today. How can I help you?",
    "Good morning! Hope you're having a great start. What would you like to shop for?",
    "Morning! 🌞 Ready to help you grab everything you need. What's on your list?",
  ],
  'good afternoon': [
    "Good afternoon! 🌤️ How can I assist you with your shopping today?",
    "Good afternoon! Looking for something specific? I'd love to help!",
    "Afternoon! Great time to shop — we've got some lovely deals today. What do you need?",
  ],
  'good evening': [
    "Good evening! 🌙 Need help picking up a few things before we close?",
    "Good evening! Still plenty of time to shop. What can I help you find?",
    "Evening! 🌆 Let me help you find what you need quickly.",
  ],
  'thank you': [
    "You're welcome! 😊 Happy to help. Need anything else?",
    "My pleasure! Let me know if there's anything else I can do.",
    "Glad I could help! Don't hesitate to ask if you need more assistance.",
    "Anytime! 🙏 Enjoy your shopping!",
  ],
  thanks: [
    "You're welcome! 😊 Happy to help. Need anything else?",
    "My pleasure! Let me know if there's anything else I can do.",
    "Glad I could help! Don't hesitate to ask if you need more assistance.",
  ],
  bye: [
    "Goodbye! 👋 Thanks for shopping with us. Have a wonderful day!",
    "See you next time! 🛒 Hope you found everything you needed.",
    "Bye! 😊 Come back soon — we're always here to help!",
  ],
  goodbye: [
    "Goodbye! 👋 Thanks for shopping with us. Have a wonderful day!",
    "Take care! 🛒 See you next time.",
    "Bye bye! 😊 Wishing you a great day ahead!",
  ],
  'how are you': [
    "I'm doing great, thank you for asking! 😄 How can I make your shopping better today?",
    "I'm wonderful! Always happy to help shoppers. What do you need?",
    "Doing fantastic! Ready to assist you. What's on your shopping list?",
  ],
};
