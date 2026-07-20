import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerOrderView } from '../../../../src/infrastructure/ui/PartnerOrderView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryCaseAssignmentRepository } from '../../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';

describe('PartnerOrderView (一覧表示と自動計算 UI)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    
    // window.scrollTo をモック化 (スクロール警告防止)
    window.scrollTo = vi.fn() as any;

    // モックリポジトリの登録
    const orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    // 発注先マスタ
    const partnerRepo = new InMemoryPartnerRepository();
    const { Partner } = await import('../../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Aソフト開発支援'));
    await partnerRepo.save(new Partner('BP002', 'Bテクノロジー'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);

    // 作業契約マスタ
    const assignmentRepo = new InMemoryCaseAssignmentRepository();
    const { CaseAssignment } = await import('../../../../src/domain/models');
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK001', 'AJ001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));
    await assignmentRepo.save(new CaseAssignment('PJ001', 'WK003', 'AJ002', '2026-08-01', '2026-10-31', 1.6, 900000, 0));
    RepositoryRegistry.registerCaseAssignmentRepository(assignmentRepo);

    // 要員マスタ
    const staffRepo = new InMemoryStaffRepository();
    const { Staff } = await import('../../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1', 1000000));
    await staffRepo.save(new Staff('MEM002', 'BP001', '要員2', 700000));
    await staffRepo.save(new Staff('MEM003', 'BP002', '要員3', 850000));
    await staffRepo.save(new Staff('MEM004', 'BP002', '要員4', 600000));
    RepositoryRegistry.registerStaffRepository(staffRepo);
  });

  it('発注一覧が正しく初期表示され、合計値が自動計算されて表示されること', async () => {
    render(<PartnerOrderView />);

    // 見出しの確認
    expect(screen.getByText('発注管理')).toBeInTheDocument();

    // 注文ID一覧が表示されていること
    expect(await screen.findByText('ORD001')).toBeInTheDocument();
    expect(screen.getByText('ORD005')).toBeInTheDocument();

    // 発注先名がマスタから解決されて表示されていること
    expect(screen.getAllByText('Aソフト開発支援')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bテクノロジー')[0]).toBeInTheDocument();

    // 合計工数および合計発注額が表示されていること
    // ORD001: 1.3人月, 1,150,000円
    expect(screen.getAllByText('1.3')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1,150,000')[0]).toBeInTheDocument();

    // ORD005: 1.6人月, 1,210,000円
    expect(screen.getAllByText('1.6')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1,210,000')[0]).toBeInTheDocument();
  });

  it('詳細ボタンをクリックすると、配下の注文明細が詳細テーブルに展開されて表示されること', async () => {
    render(<PartnerOrderView />);

    // ORD001 の「詳細」ボタンをクリック
    const detailBtns = await screen.findAllByRole('button', { name: '詳細' });
    fireEvent.click(detailBtns[0]);

    // 詳細領域に見出しや要員名・発注工数・発注額が描画されることを確認
    expect(await screen.findByText('注文明細詳細 (ORD001)')).toBeInTheDocument();
    
    // 要員名
    expect(screen.getByText('要員1')).toBeInTheDocument();
    expect(screen.getByText('要員2')).toBeInTheDocument();

    // 工数・発注単価・金額
    // MEM001: 工数0.8, 単価100万, 金額80万
    expect(screen.getByText('0.8')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('800,000')).toBeInTheDocument();

    // MEM002: 工数0.5, 単価70万, 金額35万
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('700,000')).toBeInTheDocument();
    expect(screen.getByText('350,000')).toBeInTheDocument();
  });
});
