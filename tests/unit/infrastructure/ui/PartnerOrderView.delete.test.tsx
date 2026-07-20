import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerOrderView } from '../../../../src/infrastructure/ui/PartnerOrderView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';

describe('PartnerOrderView (削除操作 UI)', () => {
  let orderRepo: InMemoryPartnerOrderRepository;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    
    // window.scrollTo & confirm をモック化
    window.scrollTo = vi.fn() as any;
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    const partnerRepo = new InMemoryPartnerRepository();
    const { Partner } = await import('../../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Aソフト開発支援'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);

    const assignmentRepo = new InMemoryCaseAssignmentRepository();
    const { CaseAssignment } = await import('../../../../src/domain/models');
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK001', 'AJ001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));
    RepositoryRegistry.registerCaseAssignmentRepository(assignmentRepo);
  });

  it('一覧行の「削除」ボタンをクリックした際、確認ダイアログ確認を経て物理削除が行われること', async () => {
    render(<PartnerOrderView />);

    // ORD006 の存在を確認
    expect(await screen.findByText('ORD006')).toBeInTheDocument();

    // ORD006 (一覧の最後の行) の削除ボタンをクリック
    const deleteBtns = screen.getAllByRole('button', { name: '削除' });
    
    // ORD006 のインデックスは 5 (ORD001〜ORD006)
    fireEvent.click(deleteBtns[5]);

    // confirm が呼ばれた後、ORD006 が画面から消滅することを検証
    await waitFor(() => {
      expect(screen.queryByText('ORD006')).toBeNull();
    });

    // リポジトリ上からも消えていること
    const deleted = await orderRepo.findById('ORD006');
    expect(deleted).toBeNull();
  });
});
