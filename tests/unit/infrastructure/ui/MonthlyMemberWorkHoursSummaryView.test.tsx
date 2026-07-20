import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthlyMemberWorkHoursSummaryView } from '../../../../src/infrastructure/ui/MonthlyMemberWorkHoursSummaryView';
import { MonthlyMemberWorkHoursSummaryUseCase } from '../../../../src/application/usecases/MonthlyMemberWorkHoursSummaryUseCase';

describe('MonthlyMemberWorkHoursSummaryView List Render', () => {
  it('要員工数サマリ画面がマトリクスグリッド形式で正常にレンダリングされること', async () => {
    const mockUseCase: MonthlyMemberWorkHoursSummaryUseCase = {
      execute: vi.fn().mockResolvedValue({
        months: ['2026-08-01', '2026-09-01'],
        rows: [
          {
            staffId: 'MEM001',
            staffName: '要員A',
            companyName: 'パートナーA社',
            efforts: {
              '2026-08-01': 0.8,
              '2026-09-01': 0.5,
            },
          },
        ],
      }),
    };

    render(<MonthlyMemberWorkHoursSummaryView useCase={mockUseCase} />);

    // 非同期読み込みの完了を待機
    const companyHeader = await screen.findByText('パートナーA社');
    expect(companyHeader).toBeInTheDocument();

    // 画面構成要素の検証
    expect(screen.getByText('要員A')).toBeInTheDocument();
    expect(screen.getByText('0.8人月')).toBeInTheDocument();
    expect(screen.getByText('0.5人月')).toBeInTheDocument();
  });
});
