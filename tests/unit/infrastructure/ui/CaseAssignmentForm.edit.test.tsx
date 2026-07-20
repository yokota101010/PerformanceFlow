import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaseAssignmentView } from '../../../../src/infrastructure/ui/CaseAssignmentView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('CaseAssignmentForm (編集UI)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    // その他経費のシード設定
    const expenseRepo = new InMemoryOtherExpenseRepository();
    expenseRepo.setSum('PJ001', 'WK001', 62000);
    expenseRepo.setSum('PJ001', 'WK002', 35000);
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);

    // window.scrollTo をモック化して jsdom の警告を回避
    window.scrollTo = vi.fn() as any;

    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    const caseRepo = new InMemoryCaseRepository();
    const { Case } = await import('../../../../src/domain/models');
    await caseRepo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    RepositoryRegistry.registerCaseRepository(caseRepo);
  });

  it('一覧の編集ボタンをクリックすると、フォームに初期値がセットされプロジェクトおよび案件の入力欄が非活性化されること', async () => {
    render(<CaseAssignmentView />);

    // ロード完了を待つ
    const editBtns = await screen.findAllByRole('button', { name: '編集' });
    
    // WK001の編集をクリック
    fireEvent.click(editBtns[0]);

    // プロジェクトおよび案件のドロップダウンが disabled になっていることを確認
    const projectSelect = screen.getByLabelText('プロジェクト') as HTMLSelectElement;
    const caseSelect = screen.getByLabelText('案件') as HTMLSelectElement;

    expect(projectSelect).toBeDisabled();
    expect(caseSelect).toBeDisabled();

    // 初期値が非同期でロードされるのを待機
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    await waitFor(() => expect(startDateInput.value).toBe('2026-08-15'));

    expect((screen.getByLabelText('契約工数 (人月)') as HTMLInputElement).value).toBe('10');
  });

  it('フォームにて工数を編集し保存をクリックすると、更新された売上・粗利率がテーブルに描画されること', async () => {
    render(<CaseAssignmentView />);

    const editBtns = await screen.findAllByRole('button', { name: '編集' });
    fireEvent.click(editBtns[0]);

    // 初期値が非同期でロードされるのを待機
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    await waitFor(() => expect(startDateInput.value).toBe('2026-08-15'));

    // 契約工数を 10 から 8 に変更
    const effortInput = screen.getByLabelText('契約工数 (人月)');
    fireEvent.change(effortInput, { target: { value: '8.0' } });

    // 保存ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    // 更新された値（売上: 6,400,000, 粗利率: 18%）が描画されることを確認
    const updatedSales = await screen.findByText('6,400,000');
    expect(updatedSales).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
  });
});
