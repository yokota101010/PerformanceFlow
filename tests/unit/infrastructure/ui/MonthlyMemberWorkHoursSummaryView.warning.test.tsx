import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthlyMemberWorkHoursSummaryView } from '../../../../src/infrastructure/ui/MonthlyMemberWorkHoursSummaryView';
import { MonthlyMemberWorkHoursSummaryUseCase } from '../../../../src/application/usecases/MonthlyMemberWorkHoursSummaryUseCase';

describe('MonthlyMemberWorkHoursSummaryView Over-Assignment Warning', () => {
  it('工数が1.0人月を超過しているセルの値が警告表現(赤字・太字・警告アイコン付き)でレンダリングされること', async () => {
    const mockUseCase: MonthlyMemberWorkHoursSummaryUseCase = {
      execute: vi.fn().mockResolvedValue({
        months: ['2026-08-01'],
        rows: [
          {
            staffId: 'MEM001',
            staffName: 'オーバー要員',
            companyName: 'パートナーA社',
            efforts: {
              '2026-08-01': 1.2, // 1.0人月超過
            },
          },
        ],
      }),
    };

    render(<MonthlyMemberWorkHoursSummaryView useCase={mockUseCase} />);

    // ロード完了待機
    const warningCell = await screen.findByText(/1.2人月/);
    expect(warningCell).toBeInTheDocument();

    // ⚠ アイコンが数値の横に含まれていること
    const iconSpan = screen.getByText(/⚠/);
    expect(iconSpan).toBeInTheDocument();

    // 文字が赤太字（CSSクラス text-red-600 font-bold）で出力されていること
    expect(warningCell).toHaveClass('text-red-600');
    expect(warningCell).toHaveClass('font-bold');
  });
});
