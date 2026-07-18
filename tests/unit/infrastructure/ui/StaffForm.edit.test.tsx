import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffForm } from '../../../../src/infrastructure/ui/StaffForm';
import { Staff } from '../../../../src/domain/models';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { StaffService } from '../../../../src/application/services/StaffService';

describe('StaffForm (編集モード)', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    mockOnSuccess.mockClear();
    mockOnCancel.mockClear();
  });

  it('編集用初期データがロードされ保存ボタン押下で更新が成功すること', async () => {
    const staff = new Staff('MEM001', 'BP001', '坂本龍馬', 1000000);

    render(
      <StaffForm
        editingStaff={staff}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // ロード検証
    const nameInput = screen.getByLabelText('氏名') as HTMLInputElement;
    expect(nameInput.value).toBe('坂本龍馬');

    const costInput = screen.getByLabelText('単価 (月額)') as HTMLInputElement;
    expect(costInput.value).toBe('1000000');

    // 値変更
    fireEvent.change(nameInput, { target: { value: '坂本武雄' } });
    fireEvent.change(costInput, { target: { value: '1200000' } });

    // 保存実行
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    const staffs = await new StaffService().getStaffs();
    const updated = staffs.find(s => s.id === 'MEM001');
    expect(updated?.name).toBe('坂本武雄');
    expect(updated?.costPerMonth).toBe(1200000);
  });
});
