const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2:1.5b';

interface OllamaMessage {
    role: 'user' | 'assistant' | 'system';
    content: string
}

interface AskAIOptions {
    messages: OllamaMessage[];
    systemPrompt: string;
}

interface AskAIResult {
    reply: string;
    shouldEscalate: boolean;
}

export async function askAI(options: AskAIOptions): Promise<AskAIResult> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt,
                },
                ...options.messages,
            ],
            options: {
                temperature: 0.7,
            },
            stream: false,
        })
    })

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.message || !data.message.content) {
        throw new Error('Invalid response from Ollama API');
    }

    const reply = data.message.content;
    const lowerReply = reply.toLowerCase();
    const shouldEscalate = lowerReply.includes('escalate') ||
        lowerReply.includes('оператор') ||
        lowerReply.includes('человек') ||
        lowerReply.includes('извините') ||
        lowerReply.includes('не могу') ||
        lowerReply.includes('sorry') ||
        lowerReply.includes('Простите');

    return { reply, shouldEscalate };
}
