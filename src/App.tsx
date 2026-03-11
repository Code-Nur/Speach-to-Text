import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Trash2, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<{ text: string; date: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      alert('Brauzeringiz Web Speech API-ni qo\'llab-quvvatlamaydi. Iltimos Chrome yoki Edge-dan foydalaning.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'uz-UZ'; // Default language

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + event.results[i][0].transcript + ' ');
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    alert('Nusxalandi!');
  };

  const clearTranscript = () => {
    if (transcript.trim()) {
      setHistory([{ text: transcript, date: new Date().toLocaleString() }, ...history]);
    }
    setTranscript('');
  };

  return (
    <div className="container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>VoiceFlow</h1>
            <p>Ovozingizni zumda matnga aylantiring</p>
          </div>
          <button 
            className="btn-icon" 
            onClick={() => setShowHistory(!showHistory)}
            title="Tarix"
          >
            <HistoryIcon size={24} />
          </button>
        </header>

        <main>
          <div className="transcript-container" style={{ 
            minHeight: '200px', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '16px', 
            padding: '1.5rem',
            marginBottom: '2rem',
            position: 'relative',
            border: '1px solid var(--glass-border)'
          }}>
            {transcript ? (
              <p style={{ color: 'white', whiteSpace: 'pre-wrap' }}>{transcript}</p>
            ) : (
              <p style={{ opacity: 0.5, fontStyle: 'italic' }}>
                {isListening ? 'Eshitmoqdaman...' : 'Gapirishni boshlash uchun mikrofonni bosing...'}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`btn-primary glow-effect ${isListening ? 'pulse-primary' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                background: isListening ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
              }}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              {isListening ? 'To\'xtatish' : 'Boshlash'}
            </motion.button>

            <button className="btn-secondary" onClick={copyToClipboard} disabled={!transcript}>
              <Copy size={20} />
            </button>
            <button className="btn-secondary" onClick={clearTranscript} disabled={!transcript}>
              <Trash2 size={20} />
            </button>
          </div>
        </main>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginTop: '2rem' }}
            >
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Tarix</h2>
                {history.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((item, idx) => (
                      <div key={idx} className="history-item" style={{ 
                        padding: '1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '12px',
                        fontSize: '0.9rem'
                      }}>
                        <p style={{ color: '#fff', marginBottom: '0.5rem' }}>{item.text}</p>
                        <small style={{ opacity: 0.4 }}>{item.date}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Hozircha tarix mavjud emas.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .btn-icon {
          background: var(--glass-bg);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 1px solid var(--glass-border);
        }
        .btn-secondary {
          background: var(--glass-bg);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 1px solid var(--glass-border);
          opacity: \${props => props.disabled ? 0.5 : 1};
        }
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .btn-secondary:disabled {
          cursor: not-allowed;
          filter: grayscale(1);
        }
      `}</style>
    </div>
  );
}

export default App;
