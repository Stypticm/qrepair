'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface LogEntry {
    id: number;
    timestamp: string;
    type: 'log' | 'error' | 'warn';
    message: string;
}

export const DebugLogger = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let logId = 0;

        // Intercept console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const addLog = (type: 'log' | 'error' | 'warn', args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            // Only capture [Push] logs
            if (message.includes('[Push]')) {
                setLogs(prev => [...prev, {
                    id: logId++,
                    timestamp: new Date().toLocaleTimeString(),
                    type,
                    message
                }].slice(-20)); // Keep last 20 logs
                setIsVisible(true);
            }
        };

        console.log = (...args) => {
            originalLog(...args);
            addLog('log', args);
        };

        console.error = (...args) => {
            originalError(...args);
            addLog('error', args);
        };

        console.warn = (...args) => {
            originalWarn(...args);
            addLog('warn', args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    const copyLogs = () => {
        const text = logs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearLogs = () => {
        setLogs([]);
        setIsVisible(false);
    };

    if (!isVisible || logs.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-black/95 text-white max-h-[50vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <span className="text-sm font-bold">🐛 Push Debug Logs</span>
                <div className="flex gap-2">
                    <button
                        onClick={copyLogs}
                        className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
                        title="Копировать логи"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={clearLogs}
                        className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                        title="Очистить"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div className="overflow-y-auto p-3 space-y-2 text-xs font-mono">
                {logs.map(log => (
                    <div
                        key={log.id}
                        className={`p-2 rounded ${log.type === 'error' ? 'bg-red-900/50 border-l-4 border-red-500' :
                                log.type === 'warn' ? 'bg-yellow-900/50 border-l-4 border-yellow-500' :
                                    'bg-gray-800/50 border-l-4 border-blue-500'
                            }`}
                    >
                        <div className="text-gray-400 mb-1">{log.timestamp}</div>
                        <div className="whitespace-pre-wrap break-words">{log.message}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
