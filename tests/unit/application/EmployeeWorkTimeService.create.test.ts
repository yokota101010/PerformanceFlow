import { describe, it, expect, beforeEach } from 'vitest';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { EmployeeWorkTimeService } from '../../../src/application/services/EmployeeWorkTimeService';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { InMemoryEmployeeRepository } from '../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { CaseAssignment, Employee } from '../../../src/domain/models';

describe('EmployeeWorkTimeService.create (US2)', () => {
  const service = new EmployeeWorkTimeService();

  beforeEach(() => {
    RepositoryRegistry.clear();

    // モックデータ登録
    // 社員 EMP001 (単価 9000), EMP002 (単価 8000)
    const empRepo = new InMemoryEmployeeRepository();
    empRepo.save(new Employee('EMP001', 'トム・デマルコ', 9000));
    RepositoryRegistry.registerEmployeeRepository(empRepo);

    // アサイン契約 WK001: 2026-08-15 〜 2026-09-30
    const assignRepo = new InMemoryCaseAssignmentRepository();
    assignRepo.save(
      new CaseAssignment('PJ001', 'WK001', 'AJ001', '2026-08-15', '2026-09-30', 1.0, 800000, 0)
    );
    RepositoryRegistry.registerCaseAssignmentRepository(assignRepo);
  });

  it('正常な入力パラメータのとき、新規工数実績が登録できること', async () => {
    // EMP002 (ロバート・マーチン) は WK001 + 2026-08 の組み合わせのシードが無いため新規登録可能
    await service.createWorkTime({
      caseAssignmentId: 'WK001',
      staffId: 'EMP002',
      targetMonth: '2026-08-01',
      workHours: 100,
    });

    const list = await service.getWorkTimes();
    const record = list.find(
      x => x.caseAssignmentId === 'WK001' && x.staffId === 'EMP002' && x.targetMonth === '2026-08-01'
    );
    expect(record).toBeDefined();
    expect(record!.workHours).toBe(100);
    expect(record!.laborCost).toBe(800000); // 8000 * 100
  });

  it('アサイン契約期間外の年月を指定したとき、エラーが発生すること', async () => {
    // 期間外の年月 (WK001 は 2026-08-15 〜 2026-09-30)
    await expect(
      service.createWorkTime({
        caseAssignmentId: 'WK001',
        staffId: 'EMP002',
        targetMonth: '2026-07-01', // 期間外
        workHours: 100,
      })
    ).rejects.toThrow('選択された年月は作業契約の対象期間外です。');
  });

  it('同一の複合キーで重複登録しようとしたとき、エラーが発生すること', async () => {
    // すでにシードデータに存在する WK001 + EMP001 + 2026-08-01 で重複登録
    await expect(
      service.createWorkTime({
        caseAssignmentId: 'WK001',
        staffId: 'EMP001',
        targetMonth: '2026-08-01',
        workHours: 50,
      })
    ).rejects.toThrow('同一の年月、作業契約、社員に対する工数実績が既に登録されています。');
  });

  it('作業時間が0時間未満または200時間超過のとき、エラーが発生すること', async () => {
    // 重複エラーを避けるため、シードと被らない EMP002 でテスト
    await expect(
      service.createWorkTime({
        caseAssignmentId: 'WK001',
        staffId: 'EMP002',
        targetMonth: '2026-08-01',
        workHours: 250, // 200h 超過
      })
    ).rejects.toThrow('作業時間は0時間以上200時間以下の整数でなければなりません。');

    await expect(
      service.createWorkTime({
        caseAssignmentId: 'WK001',
        staffId: 'EMP002',
        targetMonth: '2026-08-01',
        workHours: -5, // 0未満
      })
    ).rejects.toThrow('作業時間は0時間以上200時間以下の整数でなければなりません。');
  });
});
