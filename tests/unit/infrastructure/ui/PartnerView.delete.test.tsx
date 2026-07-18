import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartnerView } from '../../../../src/infrastructure/ui/PartnerView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryPartnerStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerStaffRepository';
import { InMemoryPartnerOrderRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { Partner } from '../../../../src/domain/models';

describe('PartnerView (削除アクション)', () => {
  let staffRepo: InMemoryPartnerStaffRepository;
  let orderRepo: InMemoryPartnerOrderRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    
    staffRepo = new InMemoryPartnerStaffRepository();
    orderRepo = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerStaffRepository(staffRepo);
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    // confirm を常に true (OK) を返すモックにする
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('要員所属または発注実績のある発注先の削除ボタンを押すと、警告エラーメッセージが表示され削除されないこと', async () => {
    render(<PartnerView />);

    // BP001 Ａソフトウェア (シードデータで参照あり) の削除ボタン
    const deleteButtons = await screen.findAllByRole('button', { name: '削除' });
    
    // BP001の行の削除ボタンをクリック
    fireEvent.click(deleteButtons[0]);

    const errorAlert = await screen.findByText('この発注先は他テーブルから参照されているため削除できません。');
    expect(errorAlert).toBeInTheDocument();

    // 一覧から消えていないこと
    expect(screen.getByText('Ａソフトウェア')).toBeInTheDocument();
  });

  it('参照のない発注先の削除ボタンを押すと、確認を経て正常に物理削除されること', async () => {
    const repo = RepositoryRegistry.getPartnerRepository();
    
    // 参照のない新規発注先を追加
    const partner3 = new Partner('BP003', '新規パートナー');
    await repo.save(partner3);
    staffRepo.setHasStaff('BP003', false);
    orderRepo.setHasOrders('BP003', false);

    render(<PartnerView />);

    // 削除ボタン取得 (3つあるはず)
    const deleteButtons = await screen.findAllByRole('button', { name: '削除' });
    
    // BP003 (3番目のボタン) をクリック
    fireEvent.click(deleteButtons[2]);

    // 削除が完了して一覧から消滅することを確認
    await waitFor(() => {
      expect(screen.queryByText('新規パートナー')).toBeNull();
    });
  });
});
