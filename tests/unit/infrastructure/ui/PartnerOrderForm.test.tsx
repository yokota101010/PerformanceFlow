import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerOrderForm } from '../../../../src/infrastructure/ui/PartnerOrderForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';

describe('PartnerOrderForm (新規登録 UI)', () => {
  let orderRepo: InMemoryPartnerOrderRepository;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    
    orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    const partnerRepo = new InMemoryPartnerRepository();
    const { Partner } = await import('../../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Aソフト開発支援'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);

    const assignmentRepo = new InMemoryCaseAssignmentRepository();
    const { CaseAssignment } = await import('../../../../src/domain/models');
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK005', 'AJ001', '2026-12-01', '2026-12-31', 1.3, 1000000, 0));
    RepositoryRegistry.registerCaseAssignmentRepository(assignmentRepo);

    const staffRepo = new InMemoryStaffRepository();
    const { Staff } = await import('../../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1', 1000000));
    RepositoryRegistry.registerStaffRepository(staffRepo);
  });

  it('新規登録フォームが正常に描画され、正しい値を送信した際に登録が成功すること', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    render(<PartnerOrderForm onSuccess={handleSuccess} onCancel={handleCancel} />);

    // 見出しの確認
    expect(screen.getByText('新規発注登録')).toBeInTheDocument();

    // マスタロードの待機
    const assignmentSelect = await screen.findByLabelText('作業契約 (アサイン)');
    await screen.findByText('WK005 (2026-12-01 〜 2026-12-31)');

    const partnerSelect = screen.getByLabelText('発注先企業');
    await screen.findByText('Aソフト開発支援 (BP001)');
    
    // 作業契約の選択
    fireEvent.change(assignmentSelect, { target: { value: 'WK005' } });
    
    // 発注先の選択
    fireEvent.change(partnerSelect, { target: { value: 'BP001' } });

    // 年月の入力
    const monthInput = screen.getByLabelText('対象年月');
    fireEvent.change(monthInput, { target: { value: '2026-12' } });

    // 送信
    const submitBtn = screen.getByRole('button', { name: '登録する' });
    fireEvent.click(submitBtn);

    // 成功コールバックの呼び出しを待機
    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    // リポジトリにデータが保存されているか検証
    const savedOrders = await orderRepo.findAll();
    const newOrder = savedOrders.find(o => o.caseAssignmentId === 'WK005' && o.targetMonth === '2026-12-01');
    expect(newOrder).toBeDefined();
    expect(newOrder?.id).toBe('ORD007'); // 自動採番の検証
  });
});
