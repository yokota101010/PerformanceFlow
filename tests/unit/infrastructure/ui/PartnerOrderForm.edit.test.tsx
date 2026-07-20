import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerOrderForm } from '../../../../src/infrastructure/ui/PartnerOrderForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';

describe('PartnerOrderForm (編集・明細追加 UI)', () => {
  let orderRepo: InMemoryPartnerOrderRepository;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    
    // window.scrollTo をモック化 (スクロール警告防止)
    window.scrollTo = vi.fn() as any;

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

    const staffRepo = new InMemoryStaffRepository();
    const { Staff } = await import('../../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1', 1000000));
    await staffRepo.save(new Staff('MEM002', 'BP001', '要員2', 700000));
    RepositoryRegistry.registerStaffRepository(staffRepo);
  });

  it('編集モードで既存発注データと明細が正しく読み込まれ、明細追加・削除に伴い金額が動的再計算されること', async () => {
    const handleSuccess = vi.fn();
    const handleCancel = vi.fn();

    render(<PartnerOrderForm editOrderId="ORD001" onSuccess={handleSuccess} onCancel={handleCancel} />);

    // 読み込み完了とタイトル描画を待機
    expect(await screen.findByText('発注編集・明細追加 (ORD001)')).toBeInTheDocument();

    // 既存明細の要員1, 要員2が表示されていること
    expect(screen.getByText('要員1')).toBeInTheDocument();
    expect(screen.getByText('要員2')).toBeInTheDocument();

    // 初期合計の検証
    // ORD001シード: 工数1.3, 金額1,150,000円
    expect(screen.getByText('1.3 人月')).toBeInTheDocument();
    expect(screen.getByText('1,150,000 円')).toBeInTheDocument();

    // 明細行の「除外」をクリックして要員2を削除する
    const removeBtns = screen.getAllByRole('button', { name: '除外' });
    fireEvent.click(removeBtns[1]); // 要員2 (MEM002)

    // 要員2が画面から消え、合計が再計算されること (MEM001分のみ: 0.8人月, 800,000円)
    expect(screen.queryByText('要員2')).toBeNull();
    expect(screen.getByText('0.8 人月')).toBeInTheDocument();
    expect(screen.getByText('800,000 円')).toBeInTheDocument();

    // 保存ボタンをクリック
    const saveBtn = screen.getByRole('button', { name: '明細変更を保存' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });

    // リポジトリデータが更新されていること
    const updated = await orderRepo.findById('ORD001');
    expect(updated).not.toBeNull();
    expect(updated?.details).toHaveLength(1);
    expect(updated?.details[0].staffId).toBe('MEM001');
  });
});
