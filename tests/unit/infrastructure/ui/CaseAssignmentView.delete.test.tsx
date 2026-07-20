import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaseAssignmentView } from '../../../../src/infrastructure/ui/CaseAssignmentView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryEmployeeWorkTimeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeWorkTimeRepository';
import { InMemoryOtherExpenseRepository } from '../../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('CaseAssignmentView (削除制限UI)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    // window.scrollTo をモック化
    window.scrollTo = vi.fn() as any;

    // confirm ダイアログをモック
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    const caseRepo = new InMemoryCaseRepository();
    const { Case } = await import('../../../../src/domain/models');
    await caseRepo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    RepositoryRegistry.registerCaseRepository(caseRepo);

    RepositoryRegistry.registerPartnerOrderRepository(new InMemoryPartnerOrderRepository());
    RepositoryRegistry.registerEmployeeWorkTimeRepository(new InMemoryEmployeeWorkTimeRepository());
    RepositoryRegistry.registerOtherExpenseRepository(new InMemoryOtherExpenseRepository());
  });

  it('実績データが存在するWK001の削除ボタンをクリックすると、警告エラーが表示されること', async () => {
    render(<CaseAssignmentView />);

    const deleteBtns = await screen.findAllByRole('button', { name: '削除' });
    
    // WK001 の削除をクリック
    fireEvent.click(deleteBtns[0]);

    // 警告メッセージが表示されることを検証
    const errorAlert = await screen.findByText(
      'この作業契約は発注実績、工数実績、またはその他経費実績から参照されているため削除できません。'
    );
    expect(errorAlert).toBeInTheDocument();
  });
});
