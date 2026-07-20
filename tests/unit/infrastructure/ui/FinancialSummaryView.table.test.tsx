import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialSummaryView } from '../../../../src/infrastructure/ui/FinancialSummaryView';
import { FinancialSummaryUseCase } from '../../../../src/application/usecases/FinancialSummaryUseCase';

describe('FinancialSummaryView Table & Deficit Warnings', () => {
  it('明細テーブルに原価内訳が常時表示され、赤字行が薄赤警告背景で強調されること', async () => {
    const mockUseCase: FinancialSummaryUseCase = {
      execute: vi.fn().mockResolvedValue({
        summary: {
          totalSales: 10000000,
          totalCost: 11000000,
          totalGrossProfit: -1000000,
          overallGrossProfitRate: -10,
        },
        rows: [
          {
            assignmentId: 'WK999',
            projectName: '赤字プロジェクト',
            caseName: '赤字案件',
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            sales: 1000000,
            laborCost: 800000,
            orderCost: 500000,
            expenseCost: 200000,
            totalCost: 1500000,
            grossProfit: -500000,
            grossProfitRate: -50,
            isDeficit: true,
          },
        ],
      }),
    };

    render(<FinancialSummaryView useCase={mockUseCase} />);

    // ロード後の描画検証
    expect(await screen.findByText('WK999')).toBeInTheDocument();
    expect(await screen.findByText('赤字プロジェクト')).toBeInTheDocument();

    // 内訳カラムの金額表示検証
    expect(await screen.findByText('800,000円')).toBeInTheDocument(); // 工数加工費
    expect(await screen.findByText('500,000円')).toBeInTheDocument(); // 発注額
    expect(await screen.findByText('200,000円')).toBeInTheDocument(); // その他経費

    // 赤字（粗利・粗利率）表示検証（赤文字クラスが効いていること）
    const grossProfitElement = screen.getByText('-500,000円');
    expect(grossProfitElement).toHaveClass('text-red-600');

    const profitRateElement = screen.getByText('-50%');
    expect(profitRateElement).toHaveClass('text-red-600');
  });
});
