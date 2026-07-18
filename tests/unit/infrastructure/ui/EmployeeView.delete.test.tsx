import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmployeeView } from '../../../../src/infrastructure/ui/EmployeeView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository';
import { Employee } from '../../../../src/domain/models';

describe('EmployeeView (削除操作とUI制御)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
    RepositoryRegistry.registerEmployeeWorkTimeRepository(new InMemoryEmployeeWorkTimeRepository());
    
    // window.confirm をモック化 (常に承認)
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('工数紐づきのある社員 (EMP001) の削除をクリックした場合、警告メッセージが表示され削除がブロックされること', async () => {
    render(<EmployeeView />);

    // ロード完了を待つ
    const empName = await screen.findByText('トム・デマルコ');
    expect(empName).toBeInTheDocument();

    // トム・デマルコの行の削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    // EMP001は1行目
    fireEvent.click(deleteButtons[0]);

    // 警告メッセージが表示されることを確認
    const alertMessage = await screen.findByText('この社員には案件工数実績が登録されているため削除できません。');
    expect(alertMessage).toBeInTheDocument();
  });

  it('新しく追加した実績なし社員を削除した場合、正常に一覧から消去されること', async () => {
    // 実績なし社員をあらかじめ登録
    const repo = RepositoryRegistry.getEmployeeRepository();
    await repo.save(new Employee('EMP004', '実績なし社員', 5000));
    
    // 工数実績リポジトリもモック (EMP004は紐づきなし)
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository() as InMemoryEmployeeWorkTimeRepository;
    workTimeRepo.setHasWorkTime('EMP004', false);

    render(<EmployeeView />);

    const newEmpName = await screen.findByText('実績なし社員');
    expect(newEmpName).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    // 新規登録社員は4行目なのでインデックスは 3
    fireEvent.click(deleteButtons[3]);

    // 一覧から消滅したことをアサーション
    await waitFor(() => {
      expect(screen.queryByText('実績なし社員')).not.toBeInTheDocument();
    });
  });
});
