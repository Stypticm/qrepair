'use client';

import { useAppStore, isMaster } from '@/stores/authStore';

export default function DebugPage() {
  const { userId, role, telegramId, setRole, setTelegramId } = useAppStore();
  
  const handleSetMaster = () => {
    setTelegramId('296925626');
    setRole('master', 296925626);
  };
  
  const handleSetClient = () => {
    setTelegramId('123456');
    setRole('client', 123456);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Zustand Store</h1>
      
      <div className="space-y-4">
        <div>
          <strong>userId:</strong> {userId}
        </div>
        <div>
          <strong>role:</strong> {role}
        </div>
        <div>
          <strong>telegramId:</strong> {telegramId}
        </div>
        <div>
          <strong>isMaster(userId):</strong> {isMaster(userId) ? 'true' : 'false'}
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={handleSetMaster}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set Master (296925626)
          </button>
          <button 
            onClick={handleSetClient}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Set Client (123456)
          </button>
        </div>
      </div>
    </div>
  );
}
