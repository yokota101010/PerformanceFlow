import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeWorkTimeView } from '../../../../src/infrastructure/ui/EmployeeWorkTimeView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';

describe('EmployeeWorkTimeView - Delete Action (US4)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    
    // confirm のモック
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('削除ボタンをクリックし、確認ダイアログでOKを押したときに、リポジトリから削除されること', async () => {
    render(<EmployeeWorkTimeView />);

    // ロード完了を待機
    await waitFor(() => {
      const tomElements = screen.getAllByText((content) => content.includes('トム・デマルコ'));
      expect(tomElements.length).toBeGreaterThan(0);
    });

    const repo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const beforeCount = (await repo.findAll()).length;

    // 削除ボタン取得・クリック (最初の削除ボタンはWK001-EMP001-2026-08-01)
    const deleteBtns = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledWith('この工数実績を削除しますか？');

    // リポジトリから物理削除されていること、および画面上からレコード数が減っていることを待機
    await waitFor(async () => {
      const afterCount = (await repo.findAll()).length;
      expect(afterCount).toBe(beforeCount - 1);
    });
  });
});
