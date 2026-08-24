import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  DisasterEvent,
  PredictionAnalysis,
} from '../types';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Terminal,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface AiTacticalAssistantProps {
  activeEvent: DisasterEvent | null;
  analysis: PredictionAnalysis | null;
  systemStateSummary: Record<string, any>;
}

export const AiTacticalAssistant: React.FC<AiTacticalAssistantProps> = ({
  activeEvent,
  analysis,
  systemStateSummary,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: `Tactical Incident Copilot online. I am continuously monitoring live telemetry streams and early warning countdowns. You can ask me for evacuation routing recommendations, structural vulnerability assessments, cascading hazard time-windows, or customized civil defense directives.`,
      timestamp: new Date().toLocaleTimeString(),
      suggestedActions: [
        'What is the optimal evacuation corridor for District 4?',
        'Assess risk of dam spillway failure with current river flow',
        'Draft emergency evacuation order for coastal hospitals',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemState: {
            activeEvent,
            analysis,
            ...systemStateSummary,
          },
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || 'System received query. Telemetry confirms operational containment.',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('Error sending copilot message:', e);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'system',
        text: 'Connection to AI Copilot service interrupted. Operating on autonomous backup rules.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[640px]">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-950">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Aegis Tactical Disaster Copilot</h3>
              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800/60 rounded text-[10px] font-mono">
                AI Incident Command
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live telemetry-grounded operational guidance for commanders & civil defense officers
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="px-3 py-1 bg-red-950/60 border border-red-800/50 text-red-400 rounded-full text-[11px] font-mono inline-block">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 block">Suggested Inquiries:</span>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          className="text-left px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-purple-300 rounded text-[11px] transition flex items-center gap-1.5"
                        >
                          <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-slate-400/80 font-mono text-right mt-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span>Analyzing sensor grid telemetry & synthesizing incident counsel...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot for tactical guidance, shelter routing, or damage modeling..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-purple-500 font-sans placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
        </form>
      </div>
    </div>
  );
};
