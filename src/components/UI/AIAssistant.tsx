import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Mic, MicOff, Loader2, Sparkles, ShoppingCart, RefreshCcw, CheckCircle2, Tag, MapPin, Route } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { type Product } from '../../data/products';
import '../../ai-assistant.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isAudio?: boolean;
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
}

interface AIAssistantProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (category: string) => void;
  onNavigateToNode: (nodeId: string, nodeName: string) => void;
  cart: Product[];
  onToggleCart: (product: Product) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  products,
  onSelectProduct,
  onNavigateToCategory,
  onNavigateToNode,
  cart,
  onToggleCart
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hi! 👋 I'm your Smart Shopping Assistant. I can help you find products, navigate the store, and discover offers. Try saying "Find milk" or "What offers do you have today?"`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService.updateProducts(products);
  }, [products]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, interimText]);

  const handleSend = (text: string, isAudio = false) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      isAudio
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      const response = aiService.processQuery(text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        suggestions: response.suggestions,
        similarProducts: response.similarProducts,
        healthierOptions: (response as any).healthierOptions,
        offers: response.offers,
        productCard: (response as any).productCard
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);

      // Voice output disabled — speech recognition (mic input) still works.
      // TTS only triggers via a dedicated speaker button (not auto-played).

      // Execute action
      if (response.action) {
        const { type, payload } = response.action;
        if (type === 'SEARCH' && payload) {
          onSelectProduct(payload as Product);
        } else if (type === 'NAVIGATE' && payload) {
          if (payload.category) {
            onNavigateToCategory(payload.category);
          } else if (payload.targetNode) {
            onNavigateToNode(payload.targetNode, payload.targetName);
          }
        }
        // COMPARE -> just show text, no extra action
      }
    }, 800);
  };

  const toggleListen = () => {
    if (isListening) {
      aiService.stopListening();
      setIsListening(false);
      setInterimText('');
    } else {
      setIsListening(true);
      setInterimText('');

      aiService.startListening(
        (finalText) => {
          setInterimText('');
          setIsListening(false);
          handleSend(finalText, true);
        },
        (errorMsg) => {
          console.error('STT Error:', errorMsg);
          setIsListening(false);
          setInterimText('');
          if (errorMsg !== 'aborted' && errorMsg !== 'no-speech') {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'ai',
                text: `Sorry, I couldn't hear that (${errorMsg}). Please try again.`
              }
            ]);
          }
        },
        () => {
          setIsListening(false);
          setInterimText('');
        },
        (interim) => {
          setInterimText(interim);
        }
      );
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="ai-fab"
          onClick={() => setIsOpen(true)}
          title="Ask AI Assistant"
        >
          <span className="ai-fab-ring" />
          <Bot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <Bot size={20} />
              <span>AI Shopping Assistant</span>
              <Sparkles size={14} className="ai-sparkles-icon" />
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-chat-messages">
            {messages.map((msg) => {
              const matchedProduct = msg.productCard
                ? products.find(p => p.name.toLowerCase() === msg.productCard!.name.toLowerCase())
                : undefined;
              const productInCart = matchedProduct ? cart.some(p => p.id === matchedProduct.id) : false;

              return (
                <div key={msg.id} className={`ai-message-wrapper ${msg.sender}`}>
                  <div className={`ai-message-bubble ${msg.sender}`}>
                    <div className="ai-message-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  </div>

                  {/* Product Card */}
                  {msg.productCard && (
                    <div className="ai-product-card">
                      <div className="ai-product-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#4ade80" />
                        <span>{msg.productCard.name}</span>
                      </div>
                      <div className="ai-product-grid">
                        <div className="ai-grid-item">
                          <span className="ai-grid-icon"><Tag size={16} /></span>
                          <div className="ai-grid-info">
                            <small>Price</small>
                            <strong>₹{msg.productCard.price}</strong>
                          </div>
                        </div>
                        <div className="ai-grid-item">
                          <span className="ai-grid-icon"><MapPin size={16} /></span>
                          <div className="ai-grid-info">
                            <small>Location</small>
                            <strong>{msg.productCard.location}</strong>
                          </div>
                        </div>
                        <div className="ai-grid-item full-width">
                          <span className="ai-grid-icon"><Route size={16} /></span>
                          <div className="ai-grid-info">
                            <small>Directions</small>
                            <strong>{msg.productCard.directions}</strong>
                          </div>
                        </div>
                      </div>

                      {matchedProduct && (
                        <button
                          className={`ai-card-cart-btn ${productInCart ? 'in-cart' : ''}`}
                          onClick={() => onToggleCart(matchedProduct)}
                          style={{
                            marginTop: '12px',
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: productInCart ? '1.5px solid rgba(34, 197, 94, 0.3)' : 'none',
                            background: productInCart ? 'rgba(34, 197, 94, 0.15)' : '#38bdf8',
                            color: productInCart ? '#4ade80' : '#0f172a',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <ShoppingCart size={14} />
                          <span>{productInCart ? 'Remove from List' : 'Add to Shopping List'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Frequently bought together / Suggested Items */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="ai-message-suggestions">
                      <div className="suggestions-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShoppingCart size={14} /> Suggested Items:</div>
                      <div className="suggestions-chips">
                        {msg.suggestions.map((suggestion, idx) => {
                          const itemProduct = products.find(p => p.name.toLowerCase() === suggestion.toLowerCase());
                          const isItemInCart = itemProduct ? cart.some(p => p.id === itemProduct.id) : false;
                          
                          return (
                            <div key={idx} className="chip-actions-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px', marginBottom: '8px' }}>
                              <button
                                className="suggestion-chip"
                                onClick={() => handleSend(`Find ${suggestion}`)}
                                style={{ marginRight: 0 }}
                              >
                                {suggestion}
                              </button>
                              {itemProduct && (
                                <button
                                  onClick={() => onToggleCart(itemProduct)}
                                  style={{
                                    background: isItemInCart ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                    border: `1.5px solid ${isItemInCart ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                                    color: isItemInCart ? '#22c55e' : '#e2e8f0',
                                    borderRadius: '20px',
                                    width: '26px',
                                    height: '26px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    marginLeft: '-6px',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold',
                                  }}
                                  title={isItemInCart ? "Remove from list" : "Add to list"}
                                >
                                  {isItemInCart ? '✓' : '+'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Similar Products */}
                  {msg.similarProducts && msg.similarProducts.length > 0 && (
                    <div className="ai-message-suggestions">
                      <div className="suggestions-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCcw size={14} /> Similar Products:</div>
                      <div className="suggestions-chips">
                        {msg.similarProducts.map((product, idx) => {
                          const itemProduct = products.find(p => p.name.toLowerCase() === product.toLowerCase());
                          const isItemInCart = itemProduct ? cart.some(p => p.id === itemProduct.id) : false;
                          
                          return (
                            <div key={`sim-${idx}`} className="chip-actions-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px', marginBottom: '8px' }}>
                              <button
                                className="suggestion-chip"
                                onClick={() => handleSend(`Find ${product}`)}
                                style={{ marginRight: 0 }}
                              >
                                {product}
                              </button>
                              {itemProduct && (
                                <button
                                  onClick={() => onToggleCart(itemProduct)}
                                  style={{
                                    background: isItemInCart ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                    border: `1.5px solid ${isItemInCart ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                                    color: isItemInCart ? '#22c55e' : '#e2e8f0',
                                    borderRadius: '20px',
                                    width: '26px',
                                    height: '26px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    marginLeft: '-6px',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold',
                                  }}
                                  title={isItemInCart ? "Remove from list" : "Add to list"}
                                >
                                  {isItemInCart ? '✓' : '+'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}



                {/* Offer Cards */}
                {msg.offers && msg.offers.length > 0 && (
                  <div className="ai-message-offers">
                    <div className="offers-scroll-container">
                      {msg.offers.map((offer: any, idx: number) => (
                        <div key={`offer-${idx}`} className="ai-offer-card">
                          <div
                            className="offer-color-banner"
                            style={{ background: offer.color }}
                          >
                            <span className="offer-tag">{offer.tag}</span>
                          </div>
                          <div className="offer-card-content">
                            <div className="offer-product-name">{offer.productName}</div>
                            <div className="offer-pricing">
                              <span className="offer-price-new">₹{offer.discountPrice}</span>
                              <span className="offer-price-old">₹{offer.originalPrice}</span>
                            </div>
                            <div className="offer-savings">
                              You save ₹{Math.round(offer.originalPrice - offer.discountPrice)}
                            </div>
                            <button
                              className="offer-find-btn"
                              onClick={() => handleSend(`Find ${offer.productName}`)}
                            >
                              Locate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="ai-message-wrapper ai">
                <div className="ai-message-bubble ai thinking">
                  <Loader2 size={16} className="spin-anim" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {/* Live transcription indicator */}
            {interimText && (
              <div className="ai-message-wrapper ai">
                <div className="ai-interim-text">
                  <Mic size={12} />
                  <span>Listening: {interimText}...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-chat-input-area">
            <button
              className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListen}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <input
              type="text"
              className="ai-text-input"
              placeholder="Ask me anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              disabled={isListening}
            />
            <button
              className="ai-send-btn"
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || isListening}
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
