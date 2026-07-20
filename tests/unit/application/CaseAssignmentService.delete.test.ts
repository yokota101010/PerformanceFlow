import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentService } from '../../../src/application/services/CaseAssignmentService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryEmployeeWorkTimeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository';
import { InMemoryOtherExpenseRepository } from '../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('CaseAssignmentService.delete (物理削除と制約)', () => {
  let service: CaseAssignmentService;
  let caseAssignmentRepo: InMemoryCaseAssignmentRepository;
  let orderRepo: InMemoryPartnerOrderRepository;
  let workTimeRepo: InMemoryEmployeeWorkTimeRepository;
  let expenseRepo: InMemoryOtherExpenseRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    caseAssignmentRepo = new InMemoryCaseAssignmentRepository();
    RepositoryRegistry.registerCaseAssignmentRepository(caseAssignmentRepo);

    orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    workTimeRepo = new InMemoryEmployeeWorkTimeRepository();
    RepositoryRegistry.registerEmployeeWorkTimeRepository(workTimeRepo);

    expenseRepo = new InMemoryOtherExpenseRepository();
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);

    service = new CaseAssignmentService();
  });

  it('発注実績ORD001等が紐づいているWK001の削除を試みると、削除制限例外がスローされること', async () => {
    // InMemoryPartnerOrderRepository にて WK001 を参照する発注があるようにモック
    // （既存のシードデータにおいて WK001 に紐づく発注データが登録されていることを確認）
    // 削除ブロックを確認
    await expect(service.deleteAssignment('PJ001', 'WK001')).rejects.toThrow(
      'この作業契約は発注実績、工数実績、またはその他経費実績から参照されているため削除できません。'
    );
  });

  it('実績が全く存在しない新規明細の場合、正常に物理削除が実行されること', async () => {
    // PJ001 内に実績の紐づかない WK005 をモック登録
    const { CaseAssignment } = await import('../../../src/domain/models');
    const temp = new CaseAssignment('PJ001', 'WK005', 'AJ001', '2026-11-01', '2026-11-15', 1.0, 500000, 0);
    await caseAssignmentRepo.save(temp);

    // 削除実行
    await service.deleteAssignment('PJ001', 'WK005');

    // 存在しないことを確認
    const deleted = await caseAssignmentRepo.findById('WK005');
    expect(deleted).toBeNull();
  });
});
