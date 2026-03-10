import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const model = searchParams.get('model')
    const limit = parseInt(searchParams.get('limit') || '100')

    let whereClause: any = {}
    if (deviceId) whereClause.deviceId = deviceId
    if (model) whereClause.device = { model }

    const marketPrices = await api.list<any>('market-prices', {
      ...whereClause,
      _sort: 'parsedAt',
      _order: 'desc',
      _limit: limit,
      _populate: 'device'
    });

    const groupedPrices = (marketPrices || []).reduce((acc: any, price: any) => {
      // Go backend may return nested unpopulated device or populated device differently.
      // Assuming device is populated:
      const dev = price.device || {};
      const deviceKey = `${dev.model || ''}_${dev.variant || ''}_${dev.storage || ''}_${dev.color || ''}`;
      if (!acc[deviceKey]) {
        acc[deviceKey] = { device: dev, prices: [], averagePrice: 0, minPrice: Infinity, maxPrice: 0, sources: new Set() };
      }
      acc[deviceKey].prices.push(price);
      acc[deviceKey].sources.add(price.source);
      acc[deviceKey].minPrice = Math.min(acc[deviceKey].minPrice, price.price);
      acc[deviceKey].maxPrice = Math.max(acc[deviceKey].maxPrice, price.price);
      return acc;
    }, {});

    Object.values(groupedPrices).forEach((group: any) => {
      const totalPrice = group.prices.reduce((sum: number, p: any) => sum + p.price, 0);
      group.averagePrice = Math.round(totalPrice / group.prices.length);
      group.sources = Array.from(group.sources);
    });

    return NextResponse.json({ success: true, data: Object.values(groupedPrices), total: (marketPrices || []).length, count: Object.keys(groupedPrices).length });

  } catch (error) {
    console.error('Error fetching market prices:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch market prices' }, { status: 500 })
  }
}
