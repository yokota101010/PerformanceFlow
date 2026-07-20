import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { EmployeeWorkTimeService } from '../../../src/application/services/EmployeeWorkTimeService';

describe('EmployeeWorkTimeService.list (US1)', () => {
  beforeEach(() => {
    // 永続化ストレージの状態をクリアして初期化
    RepositoryRegistry.clear();
  });

  it('初期化状態で起動したとき、シードデータ6件がロードされること', async () => {
    const service = new EmployeeWorkTimeService();
    const list = await service.getWorkTimes();

    expect(list.length).toBe(6);

    // シードデータ検証 (WK001, EMP001, 2026-08-01, 160h)
    const record = list.find(
      r => r.caseAssignmentId === 'WK001' && r.staffId === 'EMP001' && r.targetMonth === '2026-08-01'
    );
    expect(record).toBeDefined();
    expect(record!.workHours).toBe(160);
    // トム・デマルコ EMP001 (単価 9,000)
    expect(record!.staffPrice).toBe(9000);
    expect(record!.laborCost).toBe(1440000);
  });
});
