import { api } from '@/services/api';
import { RequestsList } from './RequestsList';

interface Master {
  id: string;
  name: string | null;
  username: string;
}

interface Request {
  id: string;
  modelname: string | null;
  price: number | null;
  username: string;
  status: string;
  createdAt: string;
  pickupPoint: string | null;
  assignedMasterId: string | null;
}

// Server Component - загружает только requests
export async function RequestsData() {
  try {
    const [skupkas, masters] = await Promise.all([
      api.list<Request>('skupkas'),
      api.list<Master>('masters'),
    ]);

    // Join master data manually
    const requestsWithMasters = skupkas.map(request => ({
      ...request,
      assignedMaster: request.assignedMasterId
        ? masters.find(m => m.id === request.assignedMasterId) || null
        : null,
      // Couriers are not explicitly pre-loaded in Go BASE yet, so null for now or fetch if needed
      assignedCourier: null,
    }));

    // Sort by createdAt desc
    const sortedRequests = requestsWithMasters.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return <RequestsList requests={sortedRequests as any} />;
  } catch (error) {
    console.error('Failed to fetch requests data:', error);
    return <RequestsList requests={[]} />;
  }
}
