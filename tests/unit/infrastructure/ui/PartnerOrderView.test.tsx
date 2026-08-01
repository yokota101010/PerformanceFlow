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
    const { PartnerOrder, OrderDetail } = await import('../../../../src/domain/models/PartnerOrder');
    const d1 = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001')
    ];
    await orderRepo.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', d1));

    const d5 = [
      new OrderDetail('ORD005', 'MEM003', 1.0, 1050000, '2026-10-01', 'BP002', 'BP002')
    ];
    await orderRepo.save(new PartnerOrder('ORD005', 'CON003', 'BP002', '2026-10-01', d5));

    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    // 発注先マスタ
    const partnerRepo = new InMemoryPartnerRepository();
    const { Partner } = await import('../../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Ａソフトウェア'));
    await partnerRepo.save(new Partner('BP002', 'Ｂエンジニアリング'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);


    // 作業契約マスタ
    const assignmentRepo = new InMemoryCaseAssignmentRepository();
    const { CaseAssignment } = await import('../../../../src/domain/models');
    await assignmentRepo.save(new CaseAssignment('PJ001', 'CON001', 'ANK001', '2026-08-15', '2026-09-30', 1.3, 1000000, 0));
    await assignmentRepo.save(new CaseAssignment('PJ001', 'CON003', 'ANK002', '2026-10-13', '2027-01-31', 4.0, 1000000, 0));
    RepositoryRegistry.registerCaseAssignmentRepository(assignmentRepo);

    // 要員マスタ
    const staffRepo = new InMemoryStaffRepository();
    const { Staff, StaffUnitPrice } = await import('../../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1'));
    await staffRepo.save(new Staff('MEM002', 'BP001', '要員2'));
    await staffRepo.save(new Staff('MEM003', 'BP002', '要員3'));
    await staffRepo.save(new Staff('MEM004', 'BP002', '要員4'));
    RepositoryRegistry.registerStaffRepository(staffRepo);

    const { LocalStorageStaffUnitPriceRepository } = await import('../../../../src/infrastructure/persistence/LocalStorageStaffUnitPriceRepository');
    const supRepo = new LocalStorageStaffUnitPriceRepository();
    await supRepo.save(new StaffUnitPrice('SUP001', 'MEM001', [{ unitPriceId: 'SUP001', startYearMonth: '2026-08', price: 1000000 }]));
    await supRepo.save(new StaffUnitPrice('SUP002', 'MEM002', [{ unitPriceId: 'SUP002', startYearMonth: '2026-08', price: 1000000 }]));
    await supRepo.save(new StaffUnitPrice('SUP003', 'MEM003', [{ unitPriceId: 'SUP003', startYearMonth: '2026-08', price: 1050000 }]));
    await supRepo.save(new StaffUnitPrice('SUP004', 'MEM004', [{ unitPriceId: 'SUP004', startYearMonth: '2026-08', price: 1050000 }]));

    RepositoryRegistry.registerStaffUnitPriceRepository(supRepo);
  });


  it('発注一覧が正しく初期表示され、合計値が自動計算されて表示されること', async () => {
    render(<PartnerOrderView />);

    // 見出しの確認
    expect(screen.getByText('発注管理')).toBeInTheDocument();

    // 注文ID一覧が表示されていること
    expect(await screen.findByText('ORD001')).toBeInTheDocument();
    expect(screen.getByText('ORD005')).toBeInTheDocument();

    // 発注先名がマスタから解決されて表示されていること
    expect(screen.getAllByText('Ａソフトウェア')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ｂエンジニアリング')[0]).toBeInTheDocument();


    // 合計工数および合計発注額が表示されていること
    // ORD001: 1.3人月, 1,300,000円
    expect(screen.getAllByText('1.3')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1,300,000')[0]).toBeInTheDocument();

    // ORD005: 1人月 (1.0), 1,050,000円
    expect(screen.getAllByText('1.0')[0]).toBeInTheDocument();
    expect(screen.getAllByText('1,050,000')[0]).toBeInTheDocument();
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
    expect(screen.getAllByText('0.8')[0]).toBeInTheDocument();

    expect(screen.getAllByText('1,000,000')[0]).toBeInTheDocument();

    expect(screen.getByText('800,000')).toBeInTheDocument();

    // MEM002: 工数0.5, 単価100万, 金額50万
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getAllByText('1,000,000')[1]).toBeInTheDocument();
    expect(screen.getByText('500,000')).toBeInTheDocument();
  });
});

