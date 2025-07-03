import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { X, Maximize2, Minimize2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface AiChatbotProps {
  eventTrigger?: string;
}

const CHAT_HISTORY_KEY = 'ai_chatbot_history';

const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
];

const AiChatbot: React.FC<AiChatbotProps> = ({ eventTrigger }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  // Try to get displayName/email from user object if available
  const displayName = (user as any)?.displayName || (user as any)?.name || '';
  const email = (user as any)?.email || '';
  const uid = (user as any)?.uid || (user as any)?.id || '';
  const [tone, setTone] = useState('friendly');

  // Personalized greeting
  const personalizedGreeting = profile && profile.displayName
    ? `Hi ${profile.displayName}, how can I help you${profile.budget?.income ? ` with your budget or financial goals?` : ` today?`}`
    : 'Hi there! How can I help you today?';

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Listen for custom event to open dialog
  useEffect(() => {
    if (!eventTrigger) return;
    const handler = () => setOpen(true);
    window.addEventListener(eventTrigger, handler);
    return () => window.removeEventListener(eventTrigger, handler);
  }, [eventTrigger]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userContext: {
            uid,
            email,
            displayName,
            profile,
          },
          history: messages.slice(-10),
          tone,
        }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'ai', content: 'Sorry, there was an error contacting the AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Only render the floating button if not using eventTrigger */}
      {!eventTrigger && (
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg p-0 w-14 h-14 flex items-center justify-center"
          onClick={() => setOpen(true)}
          variant="default"
          size="icon"
          aria-label="Open AI Chatbot"
        >
          <MessageCircle size={28} />
        </Button>
      )}
      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`p-0 overflow-hidden flex flex-col ${expanded ? 'w-full max-w-3xl h-[90vh]' : 'w-[95vw] max-w-md h-[70vh]'} transition-all`}
        >
          <DialogHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
            <DialogTitle>Lina AI</DialogTitle>
            <div className="flex gap-2">
              {/* Tone Selector */}
              <select
                className="border rounded px-2 py-1 text-sm bg-background"
                value={tone}
                onChange={e => setTone(e.target.value)}
                aria-label="Select chat tone"
              >
                {TONES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Button variant="ghost" size="icon" onClick={() => setExpanded(e => !e)} aria-label={expanded ? 'Minimize' : 'Expand'}>
                {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>
          </DialogHeader>
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-muted">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-center mt-8">{personalizedGreeting}</div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start"><div className="rounded-lg px-4 py-2 max-w-xs bg-background border animate-pulse">AI is typing…</div></div>
                )}
              </div>
            )}
          </div>
          {/* Input */}
          <form
            className="flex items-center gap-2 border-t px-4 py-2 bg-background"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Textarea
              className="resize-none flex-1 min-h-[36px] max-h-24"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={1}
              disabled={loading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="submit" disabled={!input.trim() || loading}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiChatbot; 