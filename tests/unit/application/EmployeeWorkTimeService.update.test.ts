import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { EmployeeWorkTimeService } from '../../../src/application/services/EmployeeWorkTimeService';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { Employee } from '../../../src/domain/models';

describe('EmployeeWorkTimeService.update (US3)', () => {
  const service = new EmployeeWorkTimeService();

  beforeEach(() => {
    RepositoryRegistry.clear();

    const empRepo = new InMemoryEmployeeRepository();
    empRepo.save(new Employee('EMP001', 'トム・デマルコ', 9000));
    RepositoryRegistry.registerEmployeeRepository(empRepo);
  });

  it('登録済みのデータに対して、作業時間を変更して更新できること', async () => {
    // 既存シード: WK001, EMP001, 2026-08-01 (160h)
    await service.updateWorkHours({
      caseAssignmentId: 'WK001',
      staffId: 'EMP001',
      targetMonth: '2026-08-01',
      workHours: 120, // 160 -> 120
    });

    const list = await service.getWorkTimes();
    const record = list.find(
      x => x.caseAssignmentId === 'WK001' && x.staffId === 'EMP001' && x.targetMonth === '2026-08-01'
    );
    expect(record).toBeDefined();
    expect(record!.workHours).toBe(120);
    expect(record!.laborCost).toBe(1080000); // 9000 * 120
  });

  it('存在しない複合キーで更新しようとしたとき、エラーが発生すること', async () => {
    await expect(
      service.updateWorkHours({
        caseAssignmentId: 'WK005', // 存在しない
        staffId: 'EMP001',
        targetMonth: '2026-08-01',
        workHours: 120,
      })
    ).rejects.toThrow('対象の工数実績データが存在しません。');
  });

  it('更新後の作業時間が200時間を超える、または0時間未満のとき、エラーが発生すること', async () => {
    await expect(
      service.updateWorkHours({
        caseAssignmentId: 'WK001',
        staffId: 'EMP001',
        targetMonth: '2026-08-01',
        workHours: 250, // 200超
      })
    ).rejects.toThrow('作業時間は0時間以上200時間以下の整数でなければなりません。');
  });
});
