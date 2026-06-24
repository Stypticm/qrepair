import { Message } from '@/types/chat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
    messages: Message[];
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            messages: [],
            addMessage: (message) => {
                set({ messages: [...get().messages, message] });
            },
            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: 'chat-storage',
        }
    )
);