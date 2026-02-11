import { toast } from "sonner";

export interface UpdatePriceParams {
    id: string;
    minPrice: string | number | null;
    maxPrice: string | number | null;
}

export const updateTradeInPrice = async ({ id, minPrice, maxPrice }: UpdatePriceParams) => {
    try {
        const res = await fetch('/api/admin/trade-in/price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id, 
                minPrice: minPrice || null, 
                maxPrice: maxPrice || null 
            })
        });

        if (!res.ok) {
            throw new Error('Ошибка сохранения');
        }

        return true;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
