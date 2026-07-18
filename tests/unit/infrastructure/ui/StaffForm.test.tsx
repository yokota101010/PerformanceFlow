import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffForm } from '../../../../src/infrastructure/ui/StaffForm';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryStaffRepository } from '../../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { InMemoryPartnerRepository } from '../../../../src/infrastructure/persistence/InMemoryPartnerRepository';
import { StaffService } from '../../../../src/application/services/StaffService';

describe('StaffForm (要員登録フォーム)', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
    RepositoryRegistry.registerPartnerRepository(new InMemoryPartnerRepository());
    mockOnSuccess.mockClear();
    mockOnCancel.mockClear();
  });

  it('正常入力時に新規登録が成功し onSuccess ハンドラが呼び出されること', async () => {
    render(<StaffForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // 発注先オプションがレンダリングされるのを待つ
    await screen.findByText('Ａソフトウェア');

    // 入力
    fireEvent.change(screen.getByLabelText('氏名'), { target: { value: '岡田以蔵' } });
    fireEvent.change(screen.getByLabelText('所属会社'), { target: { value: 'BP001' } });
    fireEvent.change(screen.getByLabelText('単価 (月額)'), { target: { value: '500000' } });

    // 登録実行
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    const staffs = await new StaffService().getStaffs();
    expect(staffs).toHaveLength(5); // 初期4名 + 1名
    expect(staffs[4].name).toBe('岡田以蔵');
  });

  it('氏名が未入力の場合にバリデーションエラーが表示され登録が拒否されること', async () => {
    render(<StaffForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('単価 (月額)'), { target: { value: '500000' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    const errorMsg = await screen.findByText('氏名は必須です。');
    expect(errorMsg).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
