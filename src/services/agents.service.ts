import { api } from '@/services/api';

export enum SkupkaStatus {
  Draft = 'draft',
  OnTheWay = 'on_the_way',
  InProgress = 'in_progress',
  Accepted = 'accepted',
  Paid = 'paid',
  Completed = 'completed',
  Submitted = 'submitted',
  Inspected = 'inspected',
}

export enum RepairStatus {
  Created = 'created',
  CourierAssigned = 'courier_assigned',
  InTransit = 'in_transit',
  Received = 'received',
  Unpacked = 'unpacked',
  Diagnosing = 'diagnosing',
  PriceApproval = 'price_approval',
  Repairing = 'repairing',
  Completed = 'completed',
  ReadyForPickup = 'ready_for_pickup',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export class AgentsService {
  /**
   * Проверка идемпотентности: была ли уже транзакция с таким ключом?
   */
  static async checkIdempotency(key: string): Promise<boolean> {
    try {
      const existingKey = await api.get<any>('idempotency-keys', key);
      if (existingKey) return true;
    } catch (e) {
      // Ключ не найден, продолжаем
    }

    // Сохраняем ключ
    await api.create('idempotency-keys', { id: key, createdAt: new Date().toISOString() });
    return false;
  }

  /**
   * Запись в Audit Log
   */
  static async logAudit({
    requestId,
    agentName,
    action,
    input,
    output,
    status,
  }: {
    requestId?: string;
    agentName: string;
    action: string;
    input?: any;
    output?: any;
    status: 'success' | 'error';
  }) {
    await api.create('agent-audit-logs', {
      requestId,
      agentName,
      action,
      input: input ?? {},
      output: output ?? {},
      status,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Получение контекста пользователя (профиля и последних заявок)
   */
  static async getContext(telegramId: string) {
    try {
      const users = await api.list<any>('users', { telegramId });
      const user = users[0];
      if (!user) return null;

      // Получаем последние заявки
      const [skupkas, repairs] = await Promise.all([
        api.list<any>('skupkas', { telegramId, limit: 3 }),
        api.list<any>('repair-requests', { telegramId, limit: 3 })
      ]);

      return {
        ...user,
        skupkaRequests: skupkas,
        repairRequests: repairs
      };
    } catch (e) {
      console.error('Error getting context:', e);
      return null;
    }
  }

  /**
   * Получение статуса заявки (ищет в Skupka и в RepairRequest)
   */
  static async getRequestStatus(id: string) {
    try {
      const skupka = await api.get<any>('skupkas', id);
      if (skupka) return { id, type: 'skupka', status: skupka.status };
    } catch (e) {}

    try {
      const repair = await api.get<any>('repair-requests', id);
      if (repair) return { id, type: 'repair', status: repair.status };
    } catch (e) {}

    return null;
  }

  /**
   * Эскалация
   */
  static async escalate(data: { telegramId: string; reason: string; agentName: string; context?: any }) {
    return { success: true, escalatedData: data };
  }

  /**
   * Обновление статуса заявки
   */
  static async updateRequestStatus(
    id: string,
    newStatus: string,
  ) {
    // Сначала ищем в Skupka
    try {
      const skupka = await api.get<any>('skupkas', id);
      if (skupka) {
        if (Object.values(SkupkaStatus).includes(newStatus as any)) {
          const updated = await api.patch<any>('skupkas', id, { status: newStatus });
          return { type: 'skupka', data: updated };
        } else {
          throw new Error(`Invalid status ${newStatus} for Skupka`);
        }
      }
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('404'))) throw e;
    }

    // Если нет, ищем в RepairRequest
    try {
      const repair = await api.get<any>('repair-requests', id);
      if (repair) {
        if (Object.values(RepairStatus).includes(newStatus as any)) {
          const updated = await api.patch<any>('repair-requests', id, { status: newStatus });
          return { type: 'repair', data: updated };
        } else {
          throw new Error(`Invalid status ${newStatus} for RepairRequest`);
        }
      }
    } catch (e) {
      throw new Error('Request not found');
    }

    throw new Error('Request not found');
  }
}
