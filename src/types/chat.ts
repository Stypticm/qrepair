export interface Message {
    id: string;
    senderId: string;
    senderType: 'user' | 'admin';
    text: string;
    createdAt: string;
    requestId?: string;
}