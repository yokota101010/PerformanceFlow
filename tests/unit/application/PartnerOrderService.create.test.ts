import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerOrderService } from '../../../src/application/services/PartnerOrderService';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { CaseAssignment } from '../../../src/domain/models';

describe('PartnerOrderService - Create (US2)', () => {
  let repository: InMemoryPartnerOrderRepository;
  let assignmentRepo: InMemoryCaseAssignmentRepository;
  let service: PartnerOrderService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    repository = new InMemoryPartnerOrderRepository();
    assignmentRepo = new InMemoryCaseAssignmentRepository();
    RepositoryRegistry.registerPartnerOrderRepository(repository);
    RepositoryRegistry.registerCaseAssignmentRepository(assignmentRepo);
    service = new PartnerOrderService(repository);
  });

  it('正常な入力値で新規発注が自動採番されて登録できること', async () => {
    // シードに存在しない新しいアサイン WK005 を登録
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK005', 'AJ001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));

    const command = {
      caseAssignmentId: 'WK005',
      partnerId: 'BP001',
      targetMonth: '2026-08-01'
    };

    const newId = await service.createOrder(command);
    expect(newId).toBe('ORD007');

    const saved = await repository.findById(newId);
    expect(saved).not.toBeNull();
    expect(saved?.caseAssignmentId).toBe('WK005');
    expect(saved?.partnerId).toBe('BP001');
    expect(saved?.targetMonth).toBe('2026-08-01');
  });

  it('同一のアサイン、年月、発注先で重複して登録しようとするとエラーを投げること (UQ1)', async () => {
    // WK001, BP001, 2026-08-01 はすでにシード（ORD001）として登録されている
    const command = {
      caseAssignmentId: 'WK001',
      partnerId: 'BP001',
      targetMonth: '2026-08-01'
    };

    await expect(service.createOrder(command)).rejects.toThrow(
      '同一の年月、発注先に対する発注が既に登録されています。'
    );
  });

  it('アサイン契約期間外の年月で発注を登録しようとするとエラーを投げること', async () => {
    // WK005 (2026-08-15 〜 2026-09-30) を登録
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK005', 'AJ001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));

    const command = {
      caseAssignmentId: 'WK005',
      partnerId: 'BP001',
      targetMonth: '2026-07-01' // 期間外 (対象月は 2026-08, 2026-09 のみ)
    };

    await expect(service.createOrder(command)).rejects.toThrow(
      '選択された年月は作業契約の対象期間外です。'
    );
  });
});
