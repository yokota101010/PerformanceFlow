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

  beforeEach(async () => {
    RepositoryRegistry.clear();
    const partnerRepo = new InMemoryPartnerRepository();
    const { Partner } = await import('../../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Ａソフトウェア'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);
    RepositoryRegistry.registerStaffRepository(new InMemoryStaffRepository());
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

    // 登録実行
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    const staffs = await new StaffService().getStaffs();
    expect(staffs).toHaveLength(1);
    expect(staffs[0].name).toBe('岡田以蔵');
  });

  it('氏名が未入力の場合にバリデーションエラーが表示され登録が拒否されること', async () => {
    render(<StaffForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    const errorMsg = await screen.findByText('氏名は必須です。');
    expect(errorMsg).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
