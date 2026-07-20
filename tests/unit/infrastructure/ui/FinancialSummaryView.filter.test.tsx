import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialSummaryView } from '../../../../src/infrastructure/ui/FinancialSummaryView';
import { FinancialSummaryUseCase } from '../../../../src/application/usecases/FinancialSummaryUseCase';

describe('FinancialSummaryView Filter Actions', () => {
  it('フィルター入力フォームで条件を指定し、検索ボタンを押した際に正しい引数でユースケースが実行されること', async () => {
    const mockUseCase: FinancialSummaryUseCase = {
      execute: vi.fn().mockResolvedValue({
        summary: {
          totalSales: 0,
          totalCost: 0,
          totalGrossProfit: 0,
          overallGrossProfitRate: 0,
        },
        rows: [],
      }),
    };

    render(<FinancialSummaryView useCase={mockUseCase} />);

    // ロード完了時の初期呼び出し検証
    expect(mockUseCase.execute).toHaveBeenCalledWith(undefined);

    // 読み込み完了後にインプットが表示されるのを待機
    const projectInput = await screen.findByPlaceholderText('プロジェクト名で検索...');
    fireEvent.change(projectInput, { target: { value: '次世代基幹' } });

    // 検索ボタンクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);

    // 引数付きでの呼び出し検証
    expect(mockUseCase.execute).toHaveBeenLastCalledWith({
      projectName: '次世代基幹',
      startMonth: '',
      endMonth: '',
    });
  });
});
