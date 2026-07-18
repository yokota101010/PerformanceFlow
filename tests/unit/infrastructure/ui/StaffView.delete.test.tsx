import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffView } from '../../../../src/infrastructure/ui/StaffView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { InMemoryStaffOrderDetailRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffOrderDetailRepository';
import { InMemoryStaffMonthlySummaryRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffMonthlySummaryRepository';

describe('StaffView (削除制約UI検証)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    RepositoryRegistry.registerStaffOrderDetailRepository(new InMemoryStaffOrderDetailRepository());
    RepositoryRegistry.registerStaffMonthlySummaryRepository(new InMemoryStaffMonthlySummaryRepository());
  });

  it('実績データが存在するシード要員を削除しようとした場合、警告メッセージが表示され削除が拒否されること', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<StaffView />);

    // 坂本龍馬 (MEM001) の削除ボタンをクリック
    const deleteButtons = await screen.findAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]); // 最初がMEM001の削除ボタン

    // エラー警告メッセージの表示確認
    const errorAlert = await screen.findByText('この要員は実績データから参照されているため削除できません。');
    expect(errorAlert).toBeInTheDocument();
  });
});
