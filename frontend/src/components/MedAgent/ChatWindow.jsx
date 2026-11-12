import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Info, ArrowRight, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import medAgentService from '../../services/medAgentService';
import MedicineCard, { AlternativeCard } from './MedicineCard';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const quickChips = [
    "Headache & fever",
    "Cold and cough",
    "Acidity",
    "Need Dolo 650",
    "How to add product?",
    "Create a bill"
  ];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 1,
        sender: 'agent',
        type: 'general',
        content: "Hi! I'm MedAgent, your AI pharmacy assistant. I can help you:\n• Find medicines for customer symptoms\n• Suggest alternatives for out-of-stock items\n• Guide you through the Mediblix app\n\nWhat would you like help with?"
      }
    ]);
    
    // Focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Matches closing animation duration
  };

  const handleFindAlternative = async (medicineName, category) => {
    const messageId = Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      sender: 'user',
      content: `Find alternative for ${medicineName}`
    }]);
    setIsTyping(true);

    try {
      const response = await medAgentService.getAlternatives(medicineName, category);
      
      setMessages(prev => [...prev, {
        id: messageId + 1,
        sender: 'agent',
        type: 'alternative',
        content: `Here are available alternatives for "${medicineName}":`,
        alternatives: response.alternatives || [],
        originalMedicine: response.originalMedicine
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: messageId + 1,
        sender: 'agent',
        type: 'error',
        content: "Sorry, I couldn't find alternatives right now. Please check your inventory."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const messageId = Date.now();
    const userMessage = { id: messageId, sender: 'user', content: text };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Format history for context (last 5 messages)
      const history = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model', // Assuming backend maps model -> assistant/agent if needed, or uses it directly. Gemini uses 'model'.
        parts: [{ text: m.content }] // Standard Gemini format for history
      }));

      const response = await medAgentService.sendMessage(text, history);
      
      setMessages(prev => [...prev, {
        id: messageId + 1,
        sender: 'agent',
        ...response,
        content: response.message
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: messageId + 1,
        sender: 'agent',
        type: 'error',
        content: "I'm having trouble connecting to the server. Please try again."
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleChipClick = (chip) => {
    sendMessage(chip);
  };

  const renderAgentMessage = (msg) => {
    if (msg.type === 'medicine_suggestion') {
      return (
        <div className="medagent-msg agent">
          <div className="medagent-msg-bubble">
            {msg.content}
            {msg.doctorConsultRequired && (
              <div className="medagent-doctor-warning">
                <AlertTriangle className="medagent-doctor-warning-icon" />
                <div>
                  <strong>Urgent Medical Attention Advised</strong><br/>
                  Please advise the customer to seek professional medical help.
                </div>
              </div>
            )}
          </div>
          
          {msg.medicines?.map((med, idx) => (
            <MedicineCard 
              key={idx} 
              medicine={med} 
              onFindAlternative={handleFindAlternative}
            />
          ))}

          {msg.alternatives?.length > 0 && (
            <div className="medagent-alts-container">
              {msg.alternatives.map((altGroup, idx) => (
                <div key={idx}>
                  <div className="medagent-alts-header">
                    Alternatives for {altGroup.forMedicine}
                  </div>
                  {altGroup.alternatives.map((alt, aIdx) => (
                    <AlternativeCard key={aIdx} alt={alt} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {msg.generalAdvice && !msg.doctorConsultRequired && (
            <div className="medagent-advice">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{msg.generalAdvice}</div>
            </div>
          )}
        </div>
      );
    }

    if (msg.type === 'alternative') {
      return (
        <div className="medagent-msg agent">
          <div className="medagent-msg-bubble">{msg.content}</div>
          {msg.alternatives?.length > 0 ? (
            msg.alternatives.map((alt, idx) => (
              <AlternativeCard key={idx} alt={alt} />
            ))
          ) : (
            <div className="medagent-advice" style={{ borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb', color: '#92400e' }}>
              No alternatives found in inventory.
            </div>
          )}
        </div>
      );
    }

    if (msg.type === 'app_guidance') {
      return (
        <div className="medagent-msg agent">
          <div className="medagent-msg-bubble">{msg.content}</div>
          {(msg.steps || msg.navigateTo) && (
            <div className="medagent-nav-card">
              {msg.steps && (
                <ul className="medagent-nav-steps">
                  {msg.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              )}
              {msg.navigateTo && (
                <button 
                  className="medagent-nav-btn"
                  onClick={() => {
                    navigate(msg.navigateTo);
                    onClose(); // Close widget after navigation
                  }}
                >
                  Go to {msg.pageTitle || 'Page'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="medagent-msg agent">
        <div className="medagent-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>
          {msg.content}
        </div>
      </div>
    );
  };

  return (
    <div className={`medagent-window ${isClosing ? 'closing' : ''}`}>
      {/* Header */}
      <div className="medagent-header">
        <div className="medagent-header-avatar">
          <span style={{ fontSize: '20px' }}>🏥</span>
        </div>
        <div className="medagent-header-info">
          <div className="medagent-header-title">Mediblix MedAgent</div>
          <div className="medagent-header-subtitle">Your AI Pharmacy Assistant</div>
        </div>
        <div className="medagent-header-actions">
          <button className="medagent-header-btn" onClick={handleClose}>
            <Minus size={18} />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="medagent-disclaimer">
          <AlertTriangle size={14} className="medagent-disclaimer-icon" />
          <div>
            <strong>Disclaimer:</strong> Not a substitute for professional medical advice. Always verify medicines before dispensing.
          </div>
          <button className="medagent-disclaimer-close" onClick={() => setShowDisclaimer(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="medagent-messages">
        {messages.map((msg) => (
          msg.sender === 'user' ? (
            <div key={msg.id} className="medagent-msg user">
              <div className="medagent-msg-bubble">{msg.content}</div>
            </div>
          ) : (
            <React.Fragment key={msg.id}>
              {renderAgentMessage(msg)}
            </React.Fragment>
          )
        ))}
        
        {messages.length === 1 && (
          <div className="medagent-chips">
            {quickChips.map((chip, idx) => (
              <button 
                key={idx} 
                className="medagent-chip"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="medagent-typing">
            <div className="medagent-typing-dots">
              <div className="medagent-typing-dot"></div>
              <div className="medagent-typing-dot"></div>
              <div className="medagent-typing-dot"></div>
            </div>
            <div className="medagent-typing-text">MedAgent is thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="medagent-input-area">
        <input
          ref={inputRef}
          type="text"
          className="medagent-input"
          placeholder="Describe symptoms or ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button 
          className="medagent-send-btn"
          onClick={() => sendMessage(inputValue)}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
