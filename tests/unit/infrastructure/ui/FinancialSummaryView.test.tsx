import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialSummaryView } from '../../../../src/infrastructure/ui/FinancialSummaryView';
import { FinancialSummaryUseCase } from '../../../../src/application/usecases/FinancialSummaryUseCase';

describe('FinancialSummaryView', () => {
  it('全社収支サマリカードが画面上に正しくフォーマット表示されること', async () => {
    // ユースケースのモック
    const mockUseCase: FinancialSummaryUseCase = {
      execute: vi.fn().mockResolvedValue({
        summary: {
          totalSales: 18800000,
          totalCost: 15437000,
          totalGrossProfit: 3363000,
          overallGrossProfitRate: 18,
        },
        rows: [],
      }),
    };

    render(<FinancialSummaryView useCase={mockUseCase} />);

    // ロード完了後の非同期描画を待機（または同期的にアサート）
    // 数値はカンマ区切りでフォーマット表示されること
    expect(await screen.findByText('18,800,000円')).toBeInTheDocument();
    expect(await screen.findByText('15,437,000円')).toBeInTheDocument();
    expect(await screen.findByText('3,363,000円')).toBeInTheDocument();
    expect(await screen.findByText('18%')).toBeInTheDocument();
  });
});
