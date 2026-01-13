'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatPanelProps {
  placeholder?: string;
  onSend?: (text: string) => Promise<string> | string | void;
}

export function ChatPanel({ placeholder = 'Спросите что угодно об этой секции…', onSend }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! Я помогу быстро разобраться. Задайте вопрос или опишите задачу.',
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setIsSending(true);
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      let reply = '';
      if (onSend) {
        const res = await onSend(text);
        reply = typeof res === 'string' ? res : '';
      } else {
        // Заглушка до подключения ChatGPT API
        reply = 'Сoon подключим ChatGPT API. Пока что это демо-ответ.';
      }
      const botMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Ошибка при отправке. Попробуйте еще раз.',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Имитация записи голоса (UI-индикатор), интеграция с WebAudio позже
  const toggleRecord = () => {
    setIsRecording((v) => !v);
  };

  return (
    <div className="w-full max-w-screen-sm mx-auto px-4">
      <div className="rounded-3xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden">
        <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="flex">
              <div
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-3 py-2 text-sm shadow-sm'
                    : 'mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-100 text-gray-900 px-3 py-2 text-sm shadow-sm'
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 p-2.5 flex items-center gap-2">
          <button
            aria-label="Record voice"
            onClick={toggleRecord}
            className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
              isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 text-sm text-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Запись...
            </div>
          ) : null}
          <input
            type="text"
            className="flex-1 h-11 rounded-full border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button disabled={isSending || !input.trim()} onClick={handleSend} className="h-11 px-4 bg-blue-600 hover:bg-blue-700 rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;


