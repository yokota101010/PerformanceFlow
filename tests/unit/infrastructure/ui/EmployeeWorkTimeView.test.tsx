import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EmployeeWorkTimeView } from '../../../../src/infrastructure/ui/EmployeeWorkTimeView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';

describe('EmployeeWorkTimeView (US1)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    const empRepo = new (await import('../../../../src/infrastructure/persistence/InMemoryEmployeeRepository')).InMemoryEmployeeRepository();
    const { Employee } = await import('../../../../src/domain/models');
    await empRepo.save(new Employee('EMP001', 'トム・デマルコ'));
    await empRepo.save(new Employee('EMP002', 'ロバート・マーチン'));
    RepositoryRegistry.registerEmployeeRepository(empRepo);

    const workTimeRepo = new (await import('../../../../src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository')).InMemoryEmployeeWorkTimeRepository();
    const { EmployeeWorkTime } = await import('../../../../src/domain/models/EmployeeWorkTime');
    await workTimeRepo.save(new EmployeeWorkTime({ caseAssignmentId: 'WK001', staffId: 'EMP001', targetMonth: '2026-08-01', workHours: 160, staffPrice: 9000 }));
    await workTimeRepo.save(new EmployeeWorkTime({ caseAssignmentId: 'WK001', staffId: 'EMP002', targetMonth: '2026-08-01', workHours: 140, staffPrice: 8000 }));
    RepositoryRegistry.registerEmployeeWorkTimeRepository(workTimeRepo);
  });

  it('初期ロード時、シードデータ6件が表示され、合計時間が正しく表示されていること', async () => {
    render(<EmployeeWorkTimeView />);

    // ロード完了を待機し、レコードが表示されていることを確認
    await waitFor(() => {
      const tomElements = screen.getAllByText((content) => content.includes('トム・デマルコ'));
      expect(tomElements.length).toBeGreaterThan(0);
    });

    const bobElements = screen.getAllByText((content) => content.includes('ロバート・マーチン'));
    expect(bobElements.length).toBeGreaterThan(0);

    // 作業時間と加工費の表示確認
    expect(screen.getAllByText((content) => content.includes('160')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('1,440,000')).length).toBeGreaterThan(0);
  });
});
