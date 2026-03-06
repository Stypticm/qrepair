import { prisma } from '@/lib/prisma';
import { SkupkaStatus, RepairStatus } from '@prisma/client';

export class AgentsService {
  /**
   * Проверка идемпотентности: была ли уже транзакция с таким ключом?
   */
  static async checkIdempotency(key: string): Promise<boolean> {
    const existingKey = await prisma.idempotencyKey.findUnique({
      where: { id: key },
    });

    if (existingKey) return true;

    // Сохраняем ключ
    await prisma.idempotencyKey.create({
      data: { id: key },
    });

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
    await prisma.agentAuditLog.create({
      data: {
        requestId,
        agentName,
        action,
        input: input ?? {},
        output: output ?? {},
        status,
      },
    });
  }

  /**
   * Получение контекста пользователя (профиля и последних заявок)
   */
  static async getContext(telegramId: string) {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        skupkaRequests: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        repairRequests: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    return user;
  }

  /**
   * Получение статуса заявки (ищет в Skupka и в RepairRequest)
   */
  static async getRequestStatus(id: string) {
    const skupka = await prisma.skupka.findUnique({
      where: { id },
      select: { status: true, id: true },
    });

    if (skupka) return { id, type: 'skupka', status: skupka.status };

    const repair = await prisma.repairRequest.findUnique({
      where: { id },
      select: { status: true, id: true },
    });

    if (repair) return { id, type: 'repair', status: repair.status };

    return null;
  }

  /**
   * Эскалация (например, перевод диалога на живого оператора)
   * Реальная интеграция будет зависеть от вашей системы уведомлений/чатов
   */
  static async escalate(data: { telegramId: string; reason: string; agentName: string; context?: any }) {
    // Здесь можно создать тикет для менеджера, либо отправить сообщение в админский чат.
    // Пока возвращаем заглушку успешного создания эскалации.
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
    const skupka = await prisma.skupka.findUnique({ where: { id } });
    if (skupka) {
      if (Object.values(SkupkaStatus).includes(newStatus as SkupkaStatus)) {
        const updated = await prisma.skupka.update({
          where: { id },
          data: { status: newStatus as SkupkaStatus },
        });
        return { type: 'skupka', data: updated };
      } else {
        throw new Error(`Invalid status ${newStatus} for Skupka`);
      }
    }

    // Если нет, ищем в RepairRequest
    const repair = await prisma.repairRequest.findUnique({ where: { id } });
    if (repair) {
      if (Object.values(RepairStatus).includes(newStatus as RepairStatus)) {
        const updated = await prisma.repairRequest.update({
          where: { id },
          data: { status: newStatus as RepairStatus },
        });
        return { type: 'repair', data: updated };
      } else {
        throw new Error(`Invalid status ${newStatus} for RepairRequest`);
      }
    }

    throw new Error('Request not found');
  }
}
