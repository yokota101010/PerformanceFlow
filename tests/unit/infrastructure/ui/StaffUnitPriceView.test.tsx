import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StaffUnitPriceView } from '../../../../src/infrastructure/ui/StaffUnitPriceView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { Staff, StaffUnitPrice } from '../../../../src/domain/models';

describe('StaffUnitPriceView (F09)', () => {
  beforeEach(async () => {
    localStorage.clear();
    RepositoryRegistry.clear();
    const staffRepo = RepositoryRegistry.getStaffRepository();
    await staffRepo.save(new Staff('MEM001', '坂本龍馬', 'BP001'));

    const unitPriceRepo = RepositoryRegistry.getStaffUnitPriceRepository();
    await unitPriceRepo.save(
      new StaffUnitPrice('SUP001', 'MEM001', [
        { unitPriceId: 'SUP001', startYearMonth: '2026-04', price: 1000000 },
      ])
    );
  });

  it('要員単価設定画面および要員単価テーブルが正しく表示されること', async () => {
    render(<StaffUnitPriceView />);

    expect(await screen.findByText('要員単価設定')).toBeInTheDocument();
    expect(await screen.findByText('単価適用期間・改定履歴')).toBeInTheDocument();
    const matches = await screen.findAllByText(/MEM001/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('行の編集ボタンをクリックするとフォームに値がセットされ更新保存できること', async () => {
    render(<StaffUnitPriceView />);

    const matches = await screen.findAllByText(/MEM001/);
    expect(matches.length).toBeGreaterThan(0);

    const editBtn = (await screen.findAllByRole('button', { name: '編集' }))[0];
    fireEvent.click(editBtn);

    expect(await screen.findByText('要員単価設定の編集')).toBeInTheDocument();

    const priceInput = screen.getByDisplayValue('1000000');
    fireEvent.change(priceInput, { target: { value: '1050000' } });

    const saveBtn = screen.getByRole('button', { name: '変更を保存' });
    fireEvent.click(saveBtn);

    await waitFor(async () => {
      const unitPriceRepo = RepositoryRegistry.getStaffUnitPriceRepository();
      const updated = await unitPriceRepo.findByStaffId('MEM001');
      expect(updated?.getPriceForMonth('2026-04')).toBe(1050000);
    });
  });

  it('行の削除ボタンをクリックすると要員単価設定が削除されること', async () => {
    render(<StaffUnitPriceView />);

    const matches = await screen.findAllByText(/MEM001/);
    expect(matches.length).toBeGreaterThan(0);

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteBtn = (await screen.findAllByRole('button', { name: '削除' }))[0];
    fireEvent.click(deleteBtn);

    await waitFor(async () => {
      const unitPriceRepo = RepositoryRegistry.getStaffUnitPriceRepository();
      const deleted = await unitPriceRepo.findByStaffId('MEM001');
      expect(deleted).toBeNull();
    });
  });
});
