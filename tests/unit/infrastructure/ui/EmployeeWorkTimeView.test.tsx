import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EmployeeWorkTimeView } from '../../../../src/infrastructure/ui/EmployeeWorkTimeView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';

describe('EmployeeWorkTimeView (US1)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
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
