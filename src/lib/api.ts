export const fetchAdminData = async (telegramId: string) => {
  const requestsResponse = await fetch(`/api/admin/requests?adminTelegramId=${telegramId}`);
  if (!requestsResponse.ok) {
    const errorData = await requestsResponse.json();
    throw new Error(errorData.error || 'Failed to fetch requests');
  }
  const requestsData = await requestsResponse.json();

  const mastersResponse = await fetch(`/api/admin/masters?adminTelegramId=${telegramId}`);
  if (!mastersResponse.ok) {
    const errorData = await mastersResponse.json();
    throw new Error(errorData.error || 'Failed to fetch masters');
  }
  const mastersData = await mastersResponse.json();

  const pointsResponse = await fetch(`/api/admin/points?adminTelegramId=${telegramId}`);
  if (!pointsResponse.ok) {
    const errorData = await pointsResponse.json();
    throw new Error(errorData.error || 'Failed to fetch points');
  }
  const pointsData = await pointsResponse.json();

  return { 
    requests: requestsData.requests, 
    masters: mastersData.masters, 
    points: pointsData.points 
  };
};

export const transferRequest = async ({ requestId, newPointId, newMasterId, adminTelegramId }: { requestId: string; newPointId: number; newMasterId: string; adminTelegramId: string }) => {
  const response = await fetch('/api/admin/transfer-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId,
      newPointId,
      newMasterId,
      adminTelegramId
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to transfer request');
  }

  return response.json();
};

export const assignRequest = async ({ requestId, masterId, adminTelegramId }: { requestId: string; masterId: string; adminTelegramId: string }) => {
  const response = await fetch('/api/admin/assign-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, masterId, adminTelegramId })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to assign request');
  }
  return response.json();
};

export const fetchMasterDashboard = async (telegramId: string) => {
  const response = await fetch(`/api/master/dashboard?telegramId=${telegramId}`);
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json?.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export const transferMasterRequest = async (requestId: string) => {
  const response = await fetch('/api/master/transfer-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to transfer request');
  }
  return response.json();
};
