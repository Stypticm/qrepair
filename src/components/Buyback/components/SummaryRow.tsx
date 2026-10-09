'use client';

export const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0 text-xs">
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="font-black text-white">{value}</span>
    </div>
);
