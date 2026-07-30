import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeUnitPriceView } from '../../../../src/infrastructure/ui/EmployeeUnitPriceView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { Employee, EmployeeUnitPrice } from '../../../../src/domain/models';

describe('EmployeeUnitPriceView (F08)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    const empRepo = RepositoryRegistry.getEmployeeRepository();
    await empRepo.save(new Employee('EMP001', 'テスト太郎'));

    const unitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();
    await unitPriceRepo.save(
      new EmployeeUnitPrice('EUP001', 'EMP001', [
        { unitPriceId: 'EUP001', startYearMonth: '2026-04', price: 800000 },
      ])
    );
  });

  it('F08タイトルおよび社員単価テーブルが正しく表示されること', async () => {
    render(<EmployeeUnitPriceView />);

    await waitFor(() => {
      expect(screen.getByText('社員単価設定')).toBeInTheDocument();
      expect(screen.getByText('社員単価テーブル (設定・表示)')).toBeInTheDocument();
      expect(screen.getByText(/EMP001 \(テスト太郎\)/)).toBeInTheDocument();
      expect(screen.getAllByText('2026-04').length).toBeGreaterThan(0);
      expect(screen.getByText(/800,000/)).toBeInTheDocument();
    });
  });

  it('社員単価テーブルの更新保存を行った際、社員単価集約が更新保存されること', async () => {
    render(<EmployeeUnitPriceView />);

    await waitFor(() => {
      expect(screen.getByText('社員単価設定')).toBeInTheDocument();
    });

    const priceInput = screen.getByDisplayValue('800000');
    fireEvent.change(priceInput, { target: { value: '850000' } });

    const submitBtn = screen.getByRole('button', { name: /単価改定を保存/ });
    fireEvent.click(submitBtn);

    await waitFor(async () => {
      const unitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();
      const updated = await unitPriceRepo.findByEmployeeId('EMP001');
      expect(updated).not.toBeNull();
      expect(updated?.getPriceForMonth('2026-04')).toBe(850000);
    });
  });
});
