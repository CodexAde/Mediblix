import { useState, useEffect } from 'react';
import { Stethoscope, MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import './MedAgent.css';

const MedAgentWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Pulse animation when closed
  useEffect(() => {
    if (isOpen) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
    }, 10000); // Pulse every 10 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        className={`medagent-fab ${isOpen ? 'open' : ''} ${isAnimating ? 'pulse' : ''}`}
        onClick={toggleOpen}
        aria-label="Toggle AI Assistant"
      >
        <div className="medagent-fab-ring"></div>
        {isOpen ? (
          <X size={24} />
        ) : (
          <div style={{ position: 'relative', display: 'flex' }}>
            <MessageCircle size={26} strokeWidth={2.5} />
            <Stethoscope 
              size={14} 
              strokeWidth={3} 
              style={{ 
                position: 'absolute', 
                bottom: -2, 
                right: -4,
                color: '#22c55e',
                background: 'white',
                borderRadius: '50%',
                padding: '2px'
              }} 
            />
          </div>
        )}
      </button>

      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default MedAgentWidget;
