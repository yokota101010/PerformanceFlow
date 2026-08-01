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
    await assignmentRepo.save(new CaseAssignment('PJ001', 'CON001', 'ANK001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));
    const { PartnerOrder } = await import('../../../../src/domain/models/PartnerOrder');
    await orderRepo.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', []));
  });

  it('一覧行の「削除」ボタンをクリックした際、確認ダイアログ確認を経て物理削除が行われること', async () => {
    render(<PartnerOrderView />);

    expect(await screen.findByText('ORD001')).toBeInTheDocument();

    const deleteBtns = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText('ORD001')).toBeNull();
    });

    const deleted = await orderRepo.findById('ORD001');
    expect(deleted).toBeNull();
  });
});
