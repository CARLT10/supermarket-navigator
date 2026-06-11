import {
  OFFERS,
  GENERAL_OFFERS,
  STORE_INFO,
  MARKET_BASKET,
  SYNONYMS,
  RACK_INFO,
  GREETINGS,
} from './knowledgeBase';
import { type Product } from '../data/products';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  suggestions?: string[];
  similarProducts?: string[];
  healthierOptions?: string[];
  offers?: any[];
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

    // Try to find by partial match
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
        // Find a product that matches baseTerm
        const found = this.products.find((p) => p.name.toLowerCase().includes(baseTerm));
        if (found) return found;
      }
    }
    return undefined;
  }

  private findProductFuzzy(q: string): Product | undefined {
    // Exact full-name match
    for (const p of this.products) {
      if (q.includes(p.name.toLowerCase())) {
        return p;
      }
    }

    // Significant word match (words > 3 chars)
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

  // ── CORE BRAIN: processQuery ──────────────────────────────────────────

  public processQuery(query: string): AIResponse {
    const q = query.toLowerCase().trim();
    this.pushHistory(q);

    // ────────────────────────────────────────────────────────────────────
    // 1. GREETINGS & SMALL TALK
    // ────────────────────────────────────────────────────────────────────
    const greetingKeys = Object.keys(GREETINGS);
    const hasProductIntent = [
      'where', 'find', 'show', 'take', 'need', 'buy', 'looking', 'price',
      'cost', 'offer', 'discount', 'compare', 'suggest', 'recommend',
    ].some((k) => q.includes(k));

    if (!hasProductIntent) {
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
          const responses = GREETINGS[gKey];
          return {
            text: this.pickRandom(responses),
            action: { type: 'INFO' },
          };
        }
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 2. CONTEXT MEMORY — Waiting for milk type
    // ────────────────────────────────────────────────────────────────────
    if (this.context.lastIntent === 'WAITING_FOR_TYPE') {
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
    }

    // ────────────────────────────────────────────────────────────────────
    // 3. BUDGET INTENT
    // ────────────────────────────────────────────────────────────────────
    const budgetPatterns = [
      /(?:under|for|budget|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
      /(?:₹|rs\.?|rupees?)\s*(\d+)/i,
      /(\d+)\s*(?:₹|rs|rupees?)\s*(?:budget|groceries|shopping)?/i,
      /groceries\s*(?:for|under|within)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
    ];

    let budgetAmt: number | null = null;
    for (const pattern of budgetPatterns) {
      const match = q.match(pattern);
      if (match) {
        budgetAmt = parseInt(match[1], 10);
        break;
      }
    }

    if (budgetAmt && budgetAmt > 0) {
      // Determine optional category filter
      const categoryWords: Record<string, string> = {
        fruits: 'Fruits',
        vegetables: 'Vegetables',
        veggies: 'Vegetables',
        dairy: 'Dairy',
        bakery: 'Bakery',
        snacks: 'Snacks',
        beverages: 'Beverages',
        drinks: 'Beverages',
      };

      let targetCategory: string | null = null;
      for (const [word, cat] of Object.entries(categoryWords)) {
        if (q.includes(word)) {
          targetCategory = cat;
          break;
        }
      }

      let candidates = targetCategory
        ? this.products.filter((p) => p.category === targetCategory)
        : [...this.products];

      // Greedy knapsack: sort by price ascending, pick items fitting budget
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
        let text = `Based on your ₹${budgetAmt} budget, I recommend:\n\n`;
        selected.forEach((p) => {
          text += `• ${p.name} (₹${p.price})\n`;
        });
        text += `\n💰 Total: ₹${currentTotal}\n💵 Remaining: ₹${budgetAmt - currentTotal}`;

        return { text, action: { type: 'INFO' } };
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 4. OFFERS & DISCOUNTS INTENT
    // ────────────────────────────────────────────────────────────────────
    const offerKeywords = ['offer', 'discount', 'deal', 'sale', 'promotion', 'savings', 'cheap', 'affordable'];
    if (offerKeywords.some((k) => q.includes(k))) {
      // Try specific offer match
      for (const offer of OFFERS) {
        if (offer.keywords.some((k) => q.includes(k) && !offerKeywords.includes(k))) {
          return {
            text: offer.response,
            offers: offer.structuredOffers,
            action: { type: 'INFO' },
          };
        }
      }

      // General offers
      return {
        text: '🎉 We have multiple amazing deals today! Check out these hand-picked offers below.',
        offers: GENERAL_OFFERS,
        action: { type: 'INFO' },
      };
    }

    // ────────────────────────────────────────────────────────────────────
    // 5. COMPARE INTENT
    // ────────────────────────────────────────────────────────────────────
    const compareKeywords = ['compare', 'vs', 'versus', 'better', 'difference between', 'which is better'];
    if (compareKeywords.some((k) => q.includes(k))) {
      // Try to extract two product names
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

        let text = `📊 Comparing ${a.name} vs ${b.name}:\n\n`;
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

        text += `💡 ${cheaper} is ₹${priceDiff} ${a.price <= b.price ? 'cheaper' : 'more expensive'} than ${a.price <= b.price ? b.name : a.name}.`;

        return {
          text,
          action: { type: 'COMPARE' },
        };
      }

      return {
        text: "I can help compare products! Please mention two product names. For example: \"Compare apples vs oranges\".",
        action: { type: 'INFO' },
      };
    }

    // ────────────────────────────────────────────────────────────────────
    // 6. PRODUCT PRICE QUERY
    // ────────────────────────────────────────────────────────────────────
    const priceKeywords = ['price', 'cost', 'how much', 'kitna', 'kya price', 'kितना'];
    if (priceKeywords.some((k) => q.includes(k))) {
      const product = this.findProductFuzzy(q) || this.findProductBySynonym(q);
      if (product) {
        const offers = this.getOffersForProduct(product);
        this.context.lastProduct = product.name;

        let text = `${product.name} is priced at ₹${product.price}. It's located in the ${product.category} section, Rack ${product.rackId}, Shelf ${product.shelf}. ${product.description}`;

        if (offers.length > 0) {
          text += ` 🎉 There's also a ${offers[0].tag} offer — get it for just ₹${offers[0].discountPrice}!`;
        }

        return {
          text,
          offers: offers.length > 0 ? offers : undefined,
          action: { type: 'SEARCH', payload: product },
        };
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 7. RECOMMENDATION / ALTERNATIVE INTENT
    // ────────────────────────────────────────────────────────────────────
    const recKeywords = ['suggest', 'recommend', 'alternative', 'similar', 'healthier', 'healthy option', 'better option', 'substitute'];
    if (recKeywords.some((k) => q.includes(k))) {
      // Find the product or category being asked about
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
            let text = `Here are my top picks from ${cat}:\n\n`;
            catProducts.forEach((p) => {
              text += `• ${p.name} — ₹${p.price}\n`;
            });
            return {
              text,
              action: { type: 'RECOMMEND' },
            };
          }
        }
      }

      return {
        text: "I'd love to recommend something! Could you tell me which product or category you're interested in?",
        action: { type: 'INFO' },
      };
    }

    // ────────────────────────────────────────────────────────────────────
    // 8. NAVIGATION INTENT
    // ────────────────────────────────────────────────────────────────────
    const navKeywords = ['where is', 'find', 'show me', 'take me to', 'navigate', 'aisle', 'section', 'how far'];
    const isNavigation = navKeywords.some((k) => q.includes(k));

    if (isNavigation) {
      // Check for store locations first (billing, restroom, etc.)
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

        let text = `I found ${product.name} in ${rackNav}. Rack ${product.rackId}, Shelf ${product.shelf}. Priced at ₹${product.price}.`;

        if (mbData.boughtTogether.length > 0) {
          text += ` Customers who buy ${product.name} often also pick up ${mbData.boughtTogether.slice(0, 3).join(', ')}. Would you like me to show those as well?`;
        }

        return {
          text,
          suggestions: mbData.boughtTogether.length > 0 ? mbData.boughtTogether : undefined,
          similarProducts: mbData.similar.length > 0 ? mbData.similar : undefined,
          healthierOptions: mbData.healthier.length > 0 ? mbData.healthier : undefined,
          offers: offers.length > 0 ? offers : undefined,
          action: { type: 'SEARCH', payload: product },
        };
      }

      // Category navigation
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
    }

    // ────────────────────────────────────────────────────────────────────
    // 9. PRODUCT SEARCH (General) — Any query mentioning a product
    // ────────────────────────────────────────────────────────────────────

    // Check milk special case FIRST (Priority 10)
    if (q === 'milk' || q === 'i need milk' || q === 'find milk' || q === 'get milk') {
      this.context.lastIntent = 'WAITING_FOR_TYPE';
      this.context.pendingCategory = 'milk';
      return {
        text: `What type of milk would you prefer? We have:\n\n• Whole Milk (₹295)\n• Almond Milk Unsweetened (₹263)\n\nWhich one would you like?`,
        action: { type: 'INFO' },
      };
    }

    // General product search
    const matchedProduct = this.findProductFuzzy(q) || this.findProductBySynonym(q);

    if (matchedProduct) {
      const rackNav = this.getRackNav(matchedProduct.rackId);
      const mbData = this.getMarketBasketData(matchedProduct);
      let offers = this.getOffersForProduct(matchedProduct);
      this.context.lastProduct = matchedProduct.name;

      // If no direct offer, cross-sell a random general offer
      if (offers.length === 0) {
        offers = [this.pickRandom(GENERAL_OFFERS)];
      }

      let text = `I found ${matchedProduct.name} for ₹${matchedProduct.price} in ${rackNav}. Rack ${matchedProduct.rackId}, Shelf ${matchedProduct.shelf}.`;

      if (mbData.boughtTogether.length > 0) {
        text += ` Customers who buy ${matchedProduct.name} often also pick up ${mbData.boughtTogether.slice(0, 3).join(', ')}. Would you like me to show those as well?`;
      }

      if (offers.length > 0) {
        const offer = offers[0];
        const savings = offer.originalPrice - offer.discountPrice;
        text += ` Also, you can save ₹${savings} on ${offer.productName}!`;
      }

      return {
        text,
        suggestions: mbData.boughtTogether.length > 0 ? mbData.boughtTogether : undefined,
        similarProducts: mbData.similar.length > 0 ? mbData.similar : undefined,
        healthierOptions: mbData.healthier.length > 0 ? mbData.healthier : undefined,
        offers: offers.length > 0 ? offers : undefined,
        action: { type: 'SEARCH', payload: matchedProduct },
      };
    }

    // ────────────────────────────────────────────────────────────────────
    // 11. CATEGORY NAVIGATION
    // ────────────────────────────────────────────────────────────────────
    const categories: Record<string, string> = {
      fruits: 'Fruits', fruit: 'Fruits',
      vegetables: 'Vegetables', veggies: 'Vegetables', sabzi: 'Vegetables',
      dairy: 'Dairy',
      bakery: 'Bakery',
      snacks: 'Snacks',
      beverages: 'Beverages', drinks: 'Beverages',
    };

    for (const [word, cat] of Object.entries(categories)) {
      if (q.includes(word)) {
        return {
          text: `Taking you to the ${cat} section. Let me know if you need help finding something specific!`,
          action: { type: 'NAVIGATE', payload: { category: cat } },
        };
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 12. STORE INFO
    // ────────────────────────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────────────────────────
    // 13. FALLBACK
    // ────────────────────────────────────────────────────────────────────
    return {
      text: "I couldn't find that in our current inventory. Could you try describing it differently? I can help with:\n\n• Finding products\n• Checking prices\n• Showing offers & discounts\n• Budget shopping\n• Product comparisons",
      action: { type: 'INFO' },
    };
  }
}

// ─── Singleton Export ───────────────────────────────────────────────────────
export const aiService = new AIService([]);
