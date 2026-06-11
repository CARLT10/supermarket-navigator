import {
  OFFERS,
  GENERAL_OFFERS,
  STORE_INFO,
  MARKET_BASKET,
  SYNONYMS,
  RACK_INFO,
  GREETINGS,
  RECIPES,
} from './knowledgeBase';
import { type Product } from '../data/products';

// ─── Intent Classification Types ────────────────────────────────────────────

export type IntentType =
  | 'CONTEXT_MEMORY'
  | 'GREETING'
  | 'STORE_INFO'
  | 'SHOPPING_GOAL'
  | 'DIETARY_FILTER'
  | 'BUDGET'
  | 'OFFERS'
  | 'COMPARE'
  | 'NAVIGATION'
  | 'PRICE_CHECK'
  | 'RECOMMENDATION'
  | 'CATEGORY_BROWSE'
  | 'PRODUCT_SEARCH'
  | 'GENERAL_CHAT'
  | 'UNKNOWN';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  entities: Record<string, any>;
}

// ─── Response & Context Interfaces ──────────────────────────────────────────

export interface AIResponse {
  text: string;
  suggestions?: string[];
  similarProducts?: string[];
  healthierOptions?: string[];
  offers?: any[];
  productCard?: {
    name: string;
    price: number;
    location: string;
    directions: string;
  };
  action?: {
    type: 'SEARCH' | 'NAVIGATE' | 'RECOMMEND' | 'INFO' | 'COMPARE';
    payload?: any;
  };
}

export interface AIContext {
  lastIntent: string | null;
  pendingCategory: string | null;
  lastProduct: string | null;
  conversationHistory: string[];
}

// ─── AIService Class ────────────────────────────────────────────────────────

export class AIService {
  public products: Product[] = [];
  public context: AIContext = {
    lastIntent: null,
    pendingCategory: null,
    lastProduct: null,
    conversationHistory: [],
  };
  public recognition: any = null;
  public synthesis: SpeechSynthesis | null = null;

  private isListening = false;

  constructor(products: Product[]) {
    this.products = products;

    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';
        this.recognition.maxAlternatives = 1; // Force decisive, highly accurate results

        // Provide vocabulary hints to the speech engine to increase recognition accuracy
        const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
        if (SpeechGrammarList) {
          const speechRecognitionList = new SpeechGrammarList();
          const grammar = '#JSGF V1.0; grammar supermarket; public <item> = milk | bread | vegetables | drinks | chips | chocolate | rice | eggs | butter | coffee | tea | fruit | yogurt | cheese | discount | offer | budget | price | navigate | find | show | where | compare | vegan | gluten free | dairy free | bakery | snacks | aisle | section ;';
          speechRecognitionList.addFromString(grammar, 1);
          this.recognition.grammars = speechRecognitionList;
        }
      }
    }
  }

  // ── Product updater ─────────────────────────────────────────────────────

  public updateProducts(products: Product[]): void {
    this.products = products;
  }

  // ── Speech Recognition ──────────────────────────────────────────────────

  public startListening(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void,
    onInterim?: (text: string) => void,
  ): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript && onInterim) {
        onInterim(interimTranscript);
      }

      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (_e) {
      onError('Microphone is already in use.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // ── Text-to-Speech ────────────────────────────────────────────────────

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) return;

    this.synthesis.cancel();

    const cleanText = text.replace(/[•🍪☕🥤🥜💧🥚🥛🍞🔄🎫🅿️🚻💳📋🕗📊💡💰💵🛒👋😊😄🌞🌤️🌙🌆🙏]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private pushHistory(query: string): void {
    this.context.conversationHistory.push(query);
    if (this.context.conversationHistory.length > 5) {
      this.context.conversationHistory.shift();
    }
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private findProductByName(name: string): Product | undefined {
    const lower = name.toLowerCase();
    return this.products.find((p) => p.name.toLowerCase() === lower);
  }

  private getOffersForProduct(product: Product): any[] {
    const productOffers: any[] = [];
    for (const offer of OFFERS) {
      for (const so of offer.structuredOffers) {
        if (
          so.productName.toLowerCase() === product.name.toLowerCase() ||
          product.name.toLowerCase().includes(so.productName.toLowerCase()) ||
          so.productName.toLowerCase().includes(product.name.toLowerCase())
        ) {
          productOffers.push(so);
        }
      }
    }
    return productOffers;
  }

  private getRackNav(rackId: string): string {
    const info = RACK_INFO[rackId];
    if (!info) return '';
    return `${info.aisle}, ${info.section}. It's about ${info.distance} from the entrance (${info.steps})`;
  }

  private getMarketBasketData(product: Product): {
    boughtTogether: string[];
    similar: string[];
    healthier: string[];
  } {
    const mbData = MARKET_BASKET[product.name];
    if (mbData) {
      return {
        boughtTogether: mbData.boughtTogether || [],
        similar: mbData.similar || [],
        healthier: mbData.healthier || [],
      };
    }

    for (const key of Object.keys(MARKET_BASKET)) {
      if (
        key.toLowerCase().includes(product.name.toLowerCase()) ||
        product.name.toLowerCase().includes(key.toLowerCase())
      ) {
        const d = MARKET_BASKET[key];
        return {
          boughtTogether: d.boughtTogether || [],
          similar: d.similar || [],
          healthier: d.healthier || [],
        };
      }
    }

    return { boughtTogether: [], similar: [], healthier: [] };
  }

  private findProductBySynonym(q: string): Product | undefined {
    for (const [baseTerm, synonyms] of Object.entries(SYNONYMS)) {
      const allTerms = [baseTerm, ...synonyms];
      if (allTerms.some((term) => q.includes(term))) {
        const found = this.products.find((p) => p.name.toLowerCase().includes(baseTerm));
        if (found) return found;
      }
    }
    return undefined;
  }

  private findProductFuzzy(q: string): Product | undefined {
    for (const p of this.products) {
      if (q.includes(p.name.toLowerCase())) {
        return p;
      }
    }

    for (const p of this.products) {
      const words = p.name
        .toLowerCase()
        .split(/[\s()]+/)
        .filter((w) => w.length > 3);
      if (words.some((w) => q.includes(w))) {
        return p;
      }
    }

    return undefined;
  }

  // ════════════════════════════════════════════════════════════════════════
  // ██  INTENT CLASSIFICATION LAYER
  // ════════════════════════════════════════════════════════════════════════

  private detectIntent(q: string): IntentResult {

    // ── 1. CONTEXT_MEMORY (highest priority) ──────────────────────────
    if (this.context.lastIntent === 'WAITING_FOR_TYPE') {
      return { intent: 'CONTEXT_MEMORY', confidence: 1.0, entities: {} };
    }

    // ── 2. GREETING ───────────────────────────────────────────────────
    const hasProductIntent = [
      'where', 'find', 'show', 'take', 'need', 'buy', 'looking', 'price',
      'cost', 'offer', 'discount', 'compare', 'suggest', 'recommend',
    ].some((k) => q.includes(k));

    if (!hasProductIntent) {
      const greetingKeys = Object.keys(GREETINGS);
      for (const gKey of greetingKeys) {
        const words = q.split(/\s+/);
        const isMatch =
          q === gKey ||
          q.startsWith(gKey + ' ') ||
          q.startsWith(gKey + ',') ||
          q.startsWith(gKey + '!') ||
          words.includes(gKey) ||
          q.includes(gKey);

        if (isMatch && q.length < 40) {
          return { intent: 'GREETING', confidence: 0.95, entities: { greetingKey: gKey } };
        }
      }
    }

    // ── 3. STORE_INFO ─────────────────────────────────────────────────
    const storeInfoKeywords = [
      'return', 'refund', 'exchange', 'policy', 'hours', 'open', 'close',
      'time', 'timing', 'delivery', 'shipping', 'online', 'app', 'deliver',
      'payment', 'pay', 'credit', 'cash', 'card', 'apple pay', 'method',
      'parking', 'car', 'park', 'vehicle',
      'restroom', 'toilet', 'washroom', 'bathroom',
      'exit', 'door', 'leave', 'out',
      'cart', 'trolley', 'basket', 'bags',
      'customer service', 'help desk', 'information',
      'store info', 'store details', 'about the store',
      'membership', 'loyalty', 'member', 'reward',
    ];
    if (storeInfoKeywords.some(k => q.includes(k))) {
      return { intent: 'STORE_INFO', confidence: 0.9, entities: {} };
    }

    // ── 4. SHOPPING_GOAL (Recipe) ─────────────────────────────────────
    const recipeNames = Object.keys(RECIPES);
    for (const recipe of recipeNames) {
      if (q.includes(recipe)) {
        return { intent: 'SHOPPING_GOAL', confidence: 0.9, entities: { recipeName: recipe } };
      }
    }
    const shoppingGoalKeywords = ['recipe', 'ingredients', 'how to make', 'how to bake', 'how to cook', 'prepare', 'dish'];
    if (shoppingGoalKeywords.some(k => q.includes(k))) {
      return { intent: 'SHOPPING_GOAL', confidence: 0.9, entities: { recipeName: null } };
    }

    // ── 5. DIETARY_FILTER ─────────────────────────────────────────────
    if (q.includes('vegan') || q.includes('plant-based') || q.includes('plant based')) {
      return { intent: 'DIETARY_FILTER', confidence: 0.9, entities: { dietType: 'vegan' } };
    }
    if (q.includes('gluten-free') || q.includes('gluten free') || q.includes('celiac')) {
      return { intent: 'DIETARY_FILTER', confidence: 0.9, entities: { dietType: 'gluten-free' } };
    }
    if (q.includes('dairy-free') || q.includes('dairy free') || q.includes('lactose')) {
      return { intent: 'DIETARY_FILTER', confidence: 0.9, entities: { dietType: 'dairy-free' } };
    }

    // ── 6. BUDGET ─────────────────────────────────────────────────────
    const budgetPatterns = [
      /(?:under|for|budget|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
      /(?:₹|rs\.?|rupees?)\s*(\d+)/i,
      /(\d+)\s*(?:₹|rs|rupees?)\s*(?:budget|groceries|shopping)?/i,
      /groceries\s*(?:for|under|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
    ];
    for (const pattern of budgetPatterns) {
      const match = q.match(pattern);
      if (match) {
        return { intent: 'BUDGET', confidence: 0.85, entities: { budgetAmount: parseInt(match[1], 10) } };
      }
    }
    if (q.includes('budget')) {
      return { intent: 'BUDGET', confidence: 0.85, entities: { budgetAmount: null } };
    }

    // ── 7. OFFERS ─────────────────────────────────────────────────────
    const offerKeywords = ['offer', 'discount', 'deal', 'sale', 'promotion', 'savings', 'cheap', 'affordable'];
    if (offerKeywords.some(k => q.includes(k))) {
      return { intent: 'OFFERS', confidence: 0.85, entities: {} };
    }

    // ── 8. COMPARE ────────────────────────────────────────────────────
    const compareKeywords = ['compare', 'vs', 'versus', 'better', 'difference between', 'which is better'];
    if (compareKeywords.some(k => q.includes(k))) {
      return { intent: 'COMPARE', confidence: 0.85, entities: {} };
    }

    // ── 9. NAVIGATION ─────────────────────────────────────────────────
    const navKeywords = ['where is', 'take me to', 'navigate', 'aisle', 'section', 'how far'];
    const categoryWords: Record<string, string> = {
      fruits: 'Fruits', fruit: 'Fruits',
      vegetables: 'Vegetables', veggie: 'Vegetables', veggies: 'Vegetables', sabzi: 'Vegetables',
      dairy: 'Dairy',
      bakery: 'Bakery',
      snacks: 'Snacks', snack: 'Snacks',
      beverages: 'Beverages', beverage: 'Beverages', drinks: 'Beverages',
    };
    const isNavigation = navKeywords.some(k => q.includes(k));
    // Also detect "show me [category] section" or "find [category] section"
    const hasCategoryWithSection = Object.keys(categoryWords).some(cw =>
      q.includes(cw + ' section') || q.includes(cw + ' aisle')
    );
    if (isNavigation || hasCategoryWithSection) {
      // Extract category target
      let targetCategory: string | null = null;
      for (const [word, cat] of Object.entries(categoryWords)) {
        if (q.includes(word)) {
          targetCategory = cat;
          break;
        }
      }
      return { intent: 'NAVIGATION', confidence: 0.8, entities: { targetCategory } };
    }

    // ── 10. PRICE_CHECK ───────────────────────────────────────────────
    const priceKeywords = ['price', 'cost', 'how much', 'kitna', 'kya price', 'kितना'];
    if (priceKeywords.some(k => q.includes(k))) {
      return { intent: 'PRICE_CHECK', confidence: 0.8, entities: {} };
    }

    // ── 11. RECOMMENDATION ────────────────────────────────────────────
    const recKeywords = ['suggest', 'recommend', 'alternative', 'similar', 'healthier', 'healthy option', 'healthy', 'health', 'better option', 'substitute'];
    if (recKeywords.some(k => q.includes(k))) {
      return { intent: 'RECOMMENDATION', confidence: 0.8, entities: {} };
    }

    // ── 12. CATEGORY_BROWSE ───────────────────────────────────────────
    for (const [word, cat] of Object.entries(categoryWords)) {
      if (q.includes(word)) {
        return { intent: 'CATEGORY_BROWSE', confidence: 0.7, entities: { categoryName: cat } };
      }
    }

    // ── 13. PRODUCT_SEARCH ────────────────────────────────────────────
    // Milk special case
    if (q === 'milk' || q === 'i need milk' || q === 'find milk' || q === 'get milk') {
      return { intent: 'PRODUCT_SEARCH', confidence: 0.7, entities: { isMilkSpecial: true } };
    }
    // General product fuzzy search
    const matchedProduct = this.findProductFuzzy(q) || this.findProductBySynonym(q);
    if (matchedProduct) {
      return { intent: 'PRODUCT_SEARCH', confidence: 0.7, entities: { matchedProduct } };
    }

    // ── 14. GENERAL_CHAT ──────────────────────────────────────────────
    const allStopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|something|anything|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here|couple|few|things|today|list|start|shopping|groceries|grocery|help|to";
    const leftoverWords = q.replace(new RegExp(`\\b(${allStopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\s+/g, ' ').trim();
    if (leftoverWords.length === 0 || q.includes('couple of things') || q === 'groceries') {
      return { intent: 'GENERAL_CHAT', confidence: 0.5, entities: {} };
    }

    // ── DEFAULT: UNKNOWN ──────────────────────────────────────────────
    return { intent: 'UNKNOWN', confidence: 0.0, entities: {} };
  }

  // ════════════════════════════════════════════════════════════════════════
  // ██  CORE BRAIN: processQuery (Intent Router)
  // ════════════════════════════════════════════════════════════════════════

  public processQuery(query: string): AIResponse {
    const q = query.toLowerCase().trim();
    this.pushHistory(q);

    const { intent, entities } = this.detectIntent(q);

    switch (intent) {
      case 'CONTEXT_MEMORY':    return this.handleContextMemory(q);
      case 'GREETING':          return this.handleGreeting(q, entities);
      case 'STORE_INFO':        return this.handleStoreInfo(q);
      case 'SHOPPING_GOAL':     return this.handleShoppingGoal(q, entities);
      case 'DIETARY_FILTER':    return this.handleDietaryFilter(q, entities);
      case 'BUDGET':            return this.handleBudget(q, entities);
      case 'OFFERS':            return this.handleOffers(q);
      case 'COMPARE':           return this.handleCompare(q);
      case 'NAVIGATION':        return this.handleNavigation(q, entities);
      case 'PRICE_CHECK':       return this.handlePriceCheck(q);
      case 'RECOMMENDATION':    return this.handleRecommendation(q);
      case 'CATEGORY_BROWSE':   return this.handleCategoryBrowse(q, entities);
      case 'PRODUCT_SEARCH':    return this.handleProductSearch(q, entities);
      case 'GENERAL_CHAT':      return this.handleGeneralChat();
      default:                  return this.handleFallback(q);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // ██  INTENT HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  // ── CONTEXT_MEMORY ──────────────────────────────────────────────────

  private handleContextMemory(q: string): AIResponse {
    const typeMap: Record<string, string> = {
      'low-fat': 'Whole Milk',
      'low fat': 'Whole Milk',
      'full cream': 'Whole Milk',
      toned: 'Whole Milk',
      whole: 'Whole Milk',
      almond: 'Almond Milk (Unsweetened)',
      unsweetened: 'Almond Milk (Unsweetened)',
      'lactose-free': 'Almond Milk (Unsweetened)',
      'lactose free': 'Almond Milk (Unsweetened)',
    };

    for (const [typeKey, productName] of Object.entries(typeMap)) {
      if (q.includes(typeKey)) {
        this.context.lastIntent = null;
        this.context.pendingCategory = null;

        const product = this.findProductByName(productName);
        if (product) {
          const rackNav = this.getRackNav(product.rackId);
          this.context.lastProduct = product.name;

          return {
            text: `Great choice! I found ${product.name} for ₹${product.price} in ${rackNav}. Rack ${product.rackId}, Shelf ${product.shelf}. ${product.description}`,
            action: { type: 'SEARCH', payload: product },
          };
        }
      }
    }

    // If no type matched, clear context and fall through
    this.context.lastIntent = null;
    this.context.pendingCategory = null;
    return {
      text: "I didn't catch which type you'd like. Could you say 'whole milk' or 'almond milk'?",
      action: { type: 'INFO' },
    };
  }

  // ── GREETING ────────────────────────────────────────────────────────

  private handleGreeting(_q: string, entities: Record<string, any>): AIResponse {
    const gKey = entities.greetingKey as string;
    const responses = GREETINGS[gKey];
    if (responses) {
      return {
        text: this.pickRandom(responses),
        action: { type: 'INFO' },
      };
    }
    return { text: "Hello! How can I help you today?", action: { type: 'INFO' } };
  }

  // ── STORE_INFO ──────────────────────────────────────────────────────

  private handleStoreInfo(q: string): AIResponse {
    for (const info of STORE_INFO) {
      if (info.keywords.some((k) => q.includes(k))) {
        if (q.includes('billing') || q.includes('checkout')) {
          return {
            text: info.response + ' I can take you there now.',
            action: { type: 'NAVIGATE', payload: { targetNode: 'billing', targetName: 'Billing Counter' } },
          };
        }
        return {
          text: info.response,
          suggestions: ['Customer Service', 'Restroom', 'Billing Counter'],
          action: { type: 'INFO' }
        };
      }
    }
    return { text: "For store-related questions, please visit our customer service desk near the entrance.", action: { type: 'INFO' } };
  }

  // ── SHOPPING_GOAL (Recipe Engine) ───────────────────────────────────

  private handleShoppingGoal(_q: string, entities: Record<string, any>): AIResponse {
    const recipeName = entities.recipeName as string | null;

    if (recipeName && RECIPES[recipeName]) {
      const ingredients = RECIPES[recipeName];
      const count = ingredients.length;
      const bulletPoints = ingredients.map((i: string) => `• ${i}`).join('\n');

      return {
        text: `To bake a delicious ${recipeName}, you'll need ${count} core ingredients. Great news — all ${count} products are currently available in our store!\n\n${bulletPoints}\n\nTap any of them below to locate them instantly:`,
        suggestions: ingredients.slice(0, 5),
        action: { type: 'INFO' }
      };
    }

    // Unknown recipe fallback
    return {
      text: "That dish or its ingredients are not available right now. Sorry for the inconvenience!",
      action: { type: 'INFO' }
    };
  }

  // ── DIETARY_FILTER ──────────────────────────────────────────────────

  private handleDietaryFilter(_q: string, entities: Record<string, any>): AIResponse {
    const dietType = entities.dietType as string;

    if (dietType === 'vegan') {
      const veganProducts = this.products.filter(p => ['Fruits', 'Vegetables'].includes(p.category) || ['Mixed Nuts Bag', 'Almond Milk (Unsweetened)'].includes(p.name));
      return {
        text: 'We have a great selection of vegan and plant-based options! Here are some top picks:',
        suggestions: veganProducts.map(p => p.name).slice(0, 4),
        action: { type: 'INFO' }
      };
    }

    if (dietType === 'gluten-free') {
      const gfProducts = this.products.filter(p => p.category !== 'Bakery');
      const suggestions = gfProducts.map(p => p.name).sort(() => 0.5 - Math.random()).slice(0, 4);
      return {
        text: 'Looking for gluten-free? We have many options across all categories!',
        suggestions,
        action: { type: 'INFO' }
      };
    }

    if (dietType === 'dairy-free') {
      const dfProducts = this.products.filter(p => p.category !== 'Dairy' || ['Almond Milk (Unsweetened)'].includes(p.name));
      const suggestions = dfProducts.map(p => p.name).sort(() => 0.5 - Math.random()).slice(0, 4);
      return {
        text: 'For a dairy-free diet, I highly recommend our Almond Milk and these other great options:',
        suggestions: ['Almond Milk (Unsweetened)', ...suggestions].slice(0, 4),
        action: { type: 'INFO' }
      };
    }

    return { text: "I can help with dietary filters! Try 'vegan', 'gluten-free', or 'dairy-free'.", action: { type: 'INFO' } };
  }

  // ── BUDGET ──────────────────────────────────────────────────────────

  private handleBudget(q: string, entities: Record<string, any>): AIResponse {
    const budgetAmt = entities.budgetAmount as number | null;

    if (!budgetAmt || budgetAmt <= 0) {
      return {
        text: "I can help you shop on a budget! Please tell me your budget limit. For example, say 'I need groceries under ₹500'.",
        action: { type: 'INFO' }
      };
    }

    const categoryWords: Record<string, string> = {
      fruits: 'Fruits', fruit: 'Fruits',
      vegetables: 'Vegetables', veggie: 'Vegetables', veggies: 'Vegetables',
      dairy: 'Dairy', milk: 'Dairy', butter: 'Dairy', cheese: 'Dairy',
      bakery: 'Bakery', bread: 'Bakery',
      snacks: 'Snacks', snack: 'Snacks', chips: 'Snacks',
      beverages: 'Beverages', drinks: 'Beverages', drink: 'Beverages',
    };

    let targetCategory: string | null = null;
    for (const [word, cat] of Object.entries(categoryWords)) {
      if (q.includes(word)) {
        targetCategory = cat;
        break;
      }
    }

    const specificProduct = this.findProductFuzzy(q) || this.findProductBySynonym(q);

    if (specificProduct) {
      if (specificProduct.price <= budgetAmt) {
        const offers = this.getOffersForProduct(specificProduct);
        const rackNav = this.getRackNav(specificProduct.rackId);
        this.context.lastProduct = specificProduct.name;

        let prefixText = `Here are the details for ${specificProduct.name}:`;
        const matchedWords = specificProduct.name.toLowerCase().split(/[\s()]+/);
        const stopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here|under|budget|rs|rupees";
        const queryWords = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\d+/g, '').trim().split(/[\s()]+/).filter(w => w.length > 2);
        const unassociatedWords = queryWords.filter(w => !matchedWords.some(mw => mw.includes(w) || w.includes(mw)));

        if (unassociatedWords.length > 0 && queryWords.length > 1) {
          const cleanReqRaw = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
          const cleanReq = cleanReqRaw.charAt(0).toUpperCase() + cleanReqRaw.slice(1);
          prefixText = `"${cleanReq}" is not available right now. Instead, ${specificProduct.name} is available.`;
        }

        return {
          text: prefixText,
          productCard: {
            name: specificProduct.name,
            price: specificProduct.price,
            location: `Rack ${specificProduct.rackId}, Shelf ${specificProduct.shelf}`,
            directions: rackNav
          },
          offers: offers.length > 0 ? offers : undefined,
          action: { type: 'SEARCH', payload: specificProduct },
        };
      } else {
        const similarUnderBudget = this.products.filter(p => p.category === specificProduct.category && p.price <= budgetAmt! && p.id !== specificProduct.id);
        const rackNav = this.getRackNav(specificProduct.rackId);

        const stopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here|under|budget|rs|rupees";
        const matchedWords = specificProduct.name.toLowerCase().split(/[\s()]+/);
        const queryWords = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\d+/g, '').trim().split(/[\s()]+/).filter(w => w.length > 2);
        const unassociatedWords = queryWords.filter(w => !matchedWords.some(mw => mw.includes(w) || w.includes(mw)));

        let text = `${specificProduct.name} is priced at ₹${specificProduct.price}, which is above your ₹${budgetAmt} budget.`;

        if (unassociatedWords.length > 0 && queryWords.length > 1) {
          const cleanReqRaw = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
          const cleanReq = cleanReqRaw.charAt(0).toUpperCase() + cleanReqRaw.slice(1);
          text = `"${cleanReq}" under ₹${budgetAmt} is not available right now. Instead, ${specificProduct.name} is available for ₹${specificProduct.price}.`;
        }

        if (similarUnderBudget.length > 0) {
          text += ' Here are some alternatives under budget:';
        }

        return {
          text,
          productCard: {
            name: specificProduct.name,
            price: specificProduct.price,
            location: `Rack ${specificProduct.rackId}, Shelf ${specificProduct.shelf}`,
            directions: rackNav
          },
          suggestions: similarUnderBudget.length > 0 ? similarUnderBudget.map(p => p.name).slice(0, 4) : undefined,
          action: { type: 'INFO' }
        };
      }
    }

    // No specific product found — knapsack budget allocation
    const budgetPatterns = [
      /(?:under|for|budget|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
      /(?:₹|rs\.?|rupees?)\s*(\d+)/i,
      /(\d+)\s*(?:₹|rs|rupees?)\s*(?:budget|groceries|shopping)?/i,
      /groceries\s*(?:for|under|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
    ];

    let requestedItem = q;
    for (const pattern of budgetPatterns) {
      requestedItem = requestedItem.replace(pattern, '');
    }
    requestedItem = requestedItem.replace(/\b(find|show|me|get|need|want|buy|looking for|i|a|an|some)\b/gi, '').trim();

    let candidates = targetCategory
      ? this.products.filter((p) => p.category === targetCategory)
      : [...this.products];

    candidates.sort((a, b) => a.price - b.price);

    const selected: Product[] = [];
    let currentTotal = 0;

    for (const p of candidates) {
      if (currentTotal + p.price <= budgetAmt) {
        selected.push(p);
        currentTotal += p.price;
      }
    }

    if (selected.length > 0) {
      if (requestedItem.length > 2 && !targetCategory && !q.includes('budget') && !q.includes('groceries')) {
        const text = `Sorry, ${requestedItem} under ₹${budgetAmt} is not available in our inventory. However, based on your ₹${budgetAmt} budget, I recommend the following items:\n\nTotal: ₹${currentTotal}\nRemaining: ₹${budgetAmt - currentTotal}`;
        return { text, suggestions: selected.map(p => p.name), action: { type: 'INFO' } };
      } else if (requestedItem.length > 2 && targetCategory) {
        const text = `Sorry, ${requestedItem} under ₹${budgetAmt} is not available. However, here are some ${targetCategory} products under your budget:\n\nTotal: ₹${currentTotal}\nRemaining: ₹${budgetAmt - currentTotal}`;
        return { text, suggestions: selected.map(p => p.name), action: { type: 'INFO' } };
      }

      const text = `Based on your ₹${budgetAmt} budget, I recommend the following items:\n\nTotal: ₹${currentTotal}\nRemaining: ₹${budgetAmt - currentTotal}`;
      return { text, suggestions: selected.map(p => p.name), action: { type: 'INFO' } };
    }

    return {
      text: `Sorry, we couldn't find items that fit within your ₹${budgetAmt} budget.`,
      action: { type: 'INFO' }
    };
  }

  // ── OFFERS ──────────────────────────────────────────────────────────

  private handleOffers(q: string): AIResponse {
    const offerKeywords = ['offer', 'discount', 'deal', 'sale', 'promotion', 'savings', 'cheap', 'affordable'];

    for (const offer of OFFERS) {
      if (offer.keywords.some((k) => q.includes(k) && !offerKeywords.includes(k))) {
        return {
          text: offer.response,
          offers: offer.structuredOffers,
          action: { type: 'INFO' },
        };
      }
    }

    return {
      text: 'We have multiple amazing deals today! Check out these hand-picked offers below.',
      offers: GENERAL_OFFERS,
      action: { type: 'INFO' },
    };
  }

  // ── COMPARE ─────────────────────────────────────────────────────────

  private handleCompare(q: string): AIResponse {
    const foundProducts: Product[] = [];

    for (const p of this.products) {
      const pLower = p.name.toLowerCase();
      const significantWords = pLower.split(/[\s()]+/).filter((w) => w.length > 3);
      if (q.includes(pLower) || significantWords.some((w) => q.includes(w))) {
        if (!foundProducts.find((fp) => fp.id === p.id)) {
          foundProducts.push(p);
        }
      }
      if (foundProducts.length >= 2) break;
    }

    if (foundProducts.length >= 2) {
      const [a, b] = foundProducts;
      const rackA = RACK_INFO[a.rackId];
      const rackB = RACK_INFO[b.rackId];
      const priceDiff = Math.abs(a.price - b.price);
      const cheaper = a.price <= b.price ? a.name : b.name;

      let text = `Comparing ${a.name} vs ${b.name}:\n\n`;
      text += `${a.name}:\n`;
      text += `• Price: ₹${a.price}\n`;
      text += `• Category: ${a.category}\n`;
      text += `• Location: Rack ${a.rackId}, Shelf ${a.shelf}`;
      if (rackA) text += ` (${rackA.aisle})`;
      text += `\n• ${a.description}\n\n`;

      text += `${b.name}:\n`;
      text += `• Price: ₹${b.price}\n`;
      text += `• Category: ${b.category}\n`;
      text += `• Location: Rack ${b.rackId}, Shelf ${b.shelf}`;
      if (rackB) text += ` (${rackB.aisle})`;
      text += `\n• ${b.description}\n\n`;

      text += `Note: ${cheaper} is ₹${priceDiff} ${a.price <= b.price ? 'cheaper' : 'more expensive'} than ${a.price <= b.price ? b.name : a.name}.`;

      return { text, action: { type: 'COMPARE' } };
    }

    return {
      text: "I can help compare products! Please mention two product names. For example: \"Compare apples vs oranges\".",
      action: { type: 'INFO' },
    };
  }

  // ── NAVIGATION ──────────────────────────────────────────────────────

  private handleNavigation(q: string, entities: Record<string, any>): AIResponse {
    // Check for store locations first
    for (const info of STORE_INFO) {
      if (info.keywords.some((k) => q.includes(k))) {
        if (q.includes('billing') || q.includes('checkout')) {
          return {
            text: info.response + ' I can take you there now.',
            action: { type: 'NAVIGATE', payload: { targetNode: 'billing', targetName: 'Billing Counter' } },
          };
        }
        return { text: info.response, action: { type: 'INFO' } };
      }
    }

    // Product navigation
    const product = this.findProductFuzzy(q) || this.findProductBySynonym(q);
    if (product) {
      const rackNav = this.getRackNav(product.rackId);
      const mbData = this.getMarketBasketData(product);
      const offers = this.getOffersForProduct(product);
      this.context.lastProduct = product.name;

      let text = `Here are the details for ${product.name}:`;
      const matchedWords = product.name.toLowerCase().split(/[\s()]+/);
      const stopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here";
      const queryWords = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').trim().split(/[\s()]+/).filter(w => w.length > 2);
      const unassociatedWords = queryWords.filter(w => !matchedWords.some(mw => mw.includes(w) || w.includes(mw)));

      if (unassociatedWords.length > 0 && queryWords.length > 1) {
        const cleanReqRaw = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\s+/g, ' ').trim();
        const cleanReq = cleanReqRaw.charAt(0).toUpperCase() + cleanReqRaw.slice(1);
        text = `"${cleanReq}" is not available right now. Instead, ${product.name} is available.`;
      }

      return {
        text,
        productCard: {
          name: product.name,
          price: product.price,
          location: `Rack ${product.rackId}, Shelf ${product.shelf}`,
          directions: rackNav
        },
        suggestions: mbData.boughtTogether.length > 0 ? mbData.boughtTogether : undefined,
        similarProducts: mbData.similar.length > 0 ? mbData.similar : undefined,
        healthierOptions: mbData.healthier.length > 0 ? mbData.healthier : undefined,
        offers: offers.length > 0 ? offers : undefined,
        action: { type: 'SEARCH', payload: product },
      };
    }

    // Category navigation
    const targetCategory = entities.targetCategory as string | null;
    if (targetCategory) {
      return {
        text: `Taking you to the ${targetCategory} section. Let me know if you need help finding something specific there!`,
        action: { type: 'NAVIGATE', payload: { category: targetCategory } },
      };
    }

    // Fallback for category words in query
    const catMap: Record<string, string> = {
      fruits: 'Fruits', fruit: 'Fruits',
      vegetables: 'Vegetables', veggie: 'Vegetables', veggies: 'Vegetables',
      dairy: 'Dairy',
      bakery: 'Bakery',
      snacks: 'Snacks', snack: 'Snacks',
      beverages: 'Beverages', beverage: 'Beverages',
    };
    for (const [word, cat] of Object.entries(catMap)) {
      if (q.includes(word)) {
        return {
          text: `Taking you to the ${cat} section. Let me know if you need help finding something specific there!`,
          action: { type: 'NAVIGATE', payload: { category: cat } },
        };
      }
    }

    return { text: "I can help you navigate! Which section or product are you looking for?", action: { type: 'INFO' } };
  }

  // ── PRICE_CHECK ─────────────────────────────────────────────────────

  private handlePriceCheck(q: string): AIResponse {
    const product = this.findProductFuzzy(q) || this.findProductBySynonym(q);
    if (product) {
      const offers = this.getOffersForProduct(product);
      const rackNav = this.getRackNav(product.rackId);
      this.context.lastProduct = product.name;

      return {
        text: `Here are the details for ${product.name}:`,
        productCard: {
          name: product.name,
          price: product.price,
          location: `Rack ${product.rackId}, Shelf ${product.shelf}`,
          directions: rackNav
        },
        offers: offers.length > 0 ? offers : undefined,
        action: { type: 'SEARCH', payload: product },
      };
    }

    return { text: "Which product's price would you like to know? Please mention the product name.", action: { type: 'INFO' } };
  }

  // ── RECOMMENDATION ──────────────────────────────────────────────────

  private handleRecommendation(q: string): AIResponse {
    const product = this.findProductFuzzy(q) || this.findProductBySynonym(q);

    if (product) {
      const mbData = this.getMarketBasketData(product);
      let text = `Based on ${product.name}, here are my recommendations:\n\n`;

      if (mbData.similar.length > 0) {
        text += `🔄 Similar products: ${mbData.similar.join(', ')}\n`;
      }
      if (mbData.healthier.length > 0) {
        text += `🥗 Healthier options: ${mbData.healthier.join(', ')}\n`;
      }
      if (mbData.boughtTogether.length > 0) {
        text += `🛒 Often bought together: ${mbData.boughtTogether.join(', ')}`;
      }

      return {
        text,
        suggestions: mbData.boughtTogether,
        similarProducts: mbData.similar,
        healthierOptions: mbData.healthier,
        action: { type: 'RECOMMEND' },
      };
    }

    // Category-based recommendations
    const categoryMap: Record<string, string> = {
      fruit: 'Fruits', fruits: 'Fruits',
      vegetable: 'Vegetables', vegetables: 'Vegetables', veggies: 'Vegetables',
      dairy: 'Dairy', milk: 'Dairy',
      bakery: 'Bakery', bread: 'Bakery',
      snack: 'Snacks', snacks: 'Snacks',
      beverage: 'Beverages', beverages: 'Beverages', drink: 'Beverages', drinks: 'Beverages',
    };

    for (const [word, cat] of Object.entries(categoryMap)) {
      if (q.includes(word)) {
        const catProducts = this.products.filter((p) => p.category === cat).slice(0, 5);
        if (catProducts.length > 0) {
          let text = `I have selected the following items from the ${cat} section for your consideration:\n\n`;
          catProducts.forEach((p) => {
            text += `• ${p.name} — ₹${p.price}\n`;
          });
          return { text, action: { type: 'RECOMMEND' } };
        }
      }
    }

    if (q.includes('health')) {
      return {
        text: "Here are some of our best healthy options available today. Click on any of them to locate them instantly:",
        healthierOptions: ['Organic Brown Eggs', 'Greek Yogurt', 'Almond Milk (Unsweetened)', 'Fresh Spinach', 'Mixed Nuts Bag'],
        action: { type: 'INFO' }
      };
    }

    return {
      text: "I'd love to recommend something! Could you tell me which product or category you're interested in?",
      action: { type: 'INFO' },
    };
  }

  // ── CATEGORY_BROWSE ─────────────────────────────────────────────────

  private handleCategoryBrowse(_q: string, entities: Record<string, any>): AIResponse {
    const cat = entities.categoryName as string;
    return {
      text: `Taking you to the ${cat} section. Let me know if you need help finding something specific!`,
      action: { type: 'NAVIGATE', payload: { category: cat } },
    };
  }

  // ── PRODUCT_SEARCH ──────────────────────────────────────────────────

  private handleProductSearch(q: string, entities: Record<string, any>): AIResponse {
    // Milk special case
    if (entities.isMilkSpecial) {
      this.context.lastIntent = 'WAITING_FOR_TYPE';
      this.context.pendingCategory = 'milk';
      return {
        text: `What type of milk would you prefer? We have:\n\n• Whole Milk (₹295)\n• Almond Milk Unsweetened (₹263)\n\nWhich one would you like?`,
        action: { type: 'INFO' },
      };
    }

    const matchedProduct = entities.matchedProduct as Product | undefined;

    if (matchedProduct) {
      const rackNav = this.getRackNav(matchedProduct.rackId);
      const mbData = this.getMarketBasketData(matchedProduct);
      let offers = this.getOffersForProduct(matchedProduct);
      this.context.lastProduct = matchedProduct.name;

      if (offers.length === 0) {
        offers = [this.pickRandom(GENERAL_OFFERS)];
      }

      let prefixText = `Here are the details for ${matchedProduct.name}:`;
      const matchedWords = matchedProduct.name.toLowerCase().split(/[\s()]+/);
      const stopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here";
      const queryWords = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').trim().split(/[\s()]+/).filter(w => w.length > 2);
      const unassociatedWords = queryWords.filter(w => !matchedWords.some(mw => mw.includes(w) || w.includes(mw)));

      if (unassociatedWords.length > 0 && queryWords.length > 1) {
        const cleanReqRaw = q.replace(new RegExp(`\\b(${stopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\s+/g, ' ').trim();
        const cleanReq = cleanReqRaw.charAt(0).toUpperCase() + cleanReqRaw.slice(1);
        prefixText = `"${cleanReq}" is not available right now. Instead, ${matchedProduct.name} is available.`;
      }

      return {
        text: prefixText,
        productCard: {
          name: matchedProduct.name,
          price: matchedProduct.price,
          location: `Rack ${matchedProduct.rackId}, Shelf ${matchedProduct.shelf}`,
          directions: rackNav
        },
        suggestions: mbData.boughtTogether.length > 0 ? mbData.boughtTogether : undefined,
        similarProducts: mbData.similar.length > 0 ? mbData.similar : undefined,
        healthierOptions: mbData.healthier.length > 0 ? mbData.healthier : undefined,
        offers: offers.length > 0 ? offers : undefined,
        action: { type: 'SEARCH', payload: matchedProduct },
      };
    }

    return this.handleFallback(q);
  }

  // ── GENERAL_CHAT ────────────────────────────────────────────────────

  private handleGeneralChat(): AIResponse {
    return {
      text: "I'm ready to help! What specific items are on your shopping list today?",
      action: { type: 'INFO' }
    };
  }

  // ── FALLBACK (Spell checker + typo matching) ────────────────────────

  private handleFallback(q: string): AIResponse {
    const allStopWords = "do|you|we|have|has|any|find|show|me|us|get|need|want|buy|looking|for|i|a|an|some|something|anything|the|details|price|cost|how|much|of|where|is|are|can|could|would|please|exactly|right|now|here|couple|few|things|today|list|start|shopping|groceries|grocery|help|to";
    const leftoverWords = q.replace(new RegExp(`\\b(${allStopWords})\\b`, 'gi'), '').replace(/[^\w\s-]/gi, '').replace(/\s+/g, ' ').trim();

    // --- SPELL CHECKER / TYPO MATCHING ---
    const levenshtein = (a: string, b: string): number => {
      const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      return matrix[a.length][b.length];
    };

    const bestMatch = {
      product: null as Product | null,
      dist: Infinity,
      penalty: Infinity
    };
    const searchTarget = leftoverWords.toLowerCase();

    const updateBestMatch = (dist: number, word: string, p: Product) => {
      let penalty = Math.abs(word.length - searchTarget.length);
      if (word[0] !== searchTarget[0]) penalty += 2;

      if (word.startsWith(searchTarget) || searchTarget.startsWith(word)) {
        penalty -= 5;
      }

      if (dist < bestMatch.dist || (dist === bestMatch.dist && penalty < bestMatch.penalty)) {
        bestMatch.dist = dist;
        bestMatch.penalty = penalty;
        bestMatch.product = p;
      }
    };

    if (searchTarget.length > 2) {
      for (const p of this.products) {
        const name = p.name.toLowerCase();

        for (const word of name.split(/[\s()]+/)) {
          if (word.length > 2) {
            const dist = levenshtein(searchTarget, word);
            updateBestMatch(dist, word, p);
          }
        }
      }

      for (const [key, synList] of Object.entries(SYNONYMS)) {
        const allSyns = [...synList, key];
        for (const syn of allSyns) {
          if (syn.length > 2) {
            const dist = levenshtein(searchTarget, syn.toLowerCase());
            if (dist <= 2) {
              const pMatch = this.products.find(p => p.name.toLowerCase().includes(key) || p.category.toLowerCase().includes(key));
              if (pMatch) {
                updateBestMatch(dist, syn.toLowerCase(), pMatch);
              }
            }
          }
        }
      }
    }

    if (bestMatch.product && bestMatch.dist > 0 && bestMatch.dist <= 2 && searchTarget.length > 2) {
      return {
        text: `Did you mean ${bestMatch.product.name}?`,
        suggestions: [bestMatch.product.name],
        action: { type: 'INFO' }
      };
    }

    let fallbackText = "That specific product is currently out of stock. Sorry for the inconvenience.";
    let fallbackSuggestions: string[] | undefined = undefined;

    const broadCategoryMap: Record<string, string> = {
      fruit: 'Fruits', fruits: 'Fruits', apple: 'Fruits', banana: 'Fruits',
      vegetable: 'Vegetables', vegetables: 'Vegetables', veggies: 'Vegetables', tomato: 'Vegetables',
      dairy: 'Dairy', milk: 'Dairy', cheese: 'Dairy', yogurt: 'Dairy', butter: 'Dairy',
      bakery: 'Bakery', bread: 'Bakery', cake: 'Bakery', cookie: 'Bakery',
      snack: 'Snacks', snacks: 'Snacks', chips: 'Snacks', nuts: 'Snacks',
      beverage: 'Beverages', beverages: 'Beverages', drink: 'Beverages', drinks: 'Beverages', water: 'Beverages', juice: 'Beverages', coffee: 'Beverages'
    };

    let matchedCat: string | null = null;
    for (const [word, cat] of Object.entries(broadCategoryMap)) {
      if (q.includes(word)) {
        matchedCat = cat;
        break;
      }
    }

    if (matchedCat) {
      const catProducts = this.products.filter(p => p.category === matchedCat).slice(0, 4);
      if (catProducts.length > 0) {
        fallbackText += ` However, we do have other items in the ${matchedCat} section:`;
        fallbackSuggestions = catProducts.map(p => p.name);
      }
    }

    return {
      text: fallbackText,
      suggestions: fallbackSuggestions,
      action: { type: 'INFO' },
    };
  }
}

// ─── Singleton Export ───────────────────────────────────────────────────────
export const aiService = new AIService([]);
