import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { EmployeeWorkTimeService } from '../../../src/application/services/EmployeeWorkTimeService';

describe('EmployeeWorkTimeService.delete (US4)', () => {
  const service = new EmployeeWorkTimeService();

  beforeEach(() => {
    RepositoryRegistry.clear();
  });

  it('登録済みのデータに対して、物理削除が成功し、一覧から消去されること', async () => {
    // 既存シード: WK001, EMP001, 2026-08-01 (160h)
    const listBefore = await service.getWorkTimes();
    expect(listBefore.some(x => x.caseAssignmentId === 'WK001' && x.staffId === 'EMP001' && x.targetMonth === '2026-08-01')).toBe(true);

    await service.deleteWorkTime('WK001', 'EMP001', '2026-08-01');

    const listAfter = await service.getWorkTimes();
    expect(listAfter.some(x => x.caseAssignmentId === 'WK001' && x.staffId === 'EMP001' && x.targetMonth === '2026-08-01')).toBe(false);
  });
});
