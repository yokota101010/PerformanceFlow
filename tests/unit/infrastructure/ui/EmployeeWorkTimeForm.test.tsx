import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeWorkTimeForm } from '../../../../src/infrastructure/ui/EmployeeWorkTimeForm';

const mockCreateWorkTime = vi.fn().mockResolvedValue(undefined);
const mockUpdateWorkHours = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../../src/application/services/EmployeeWorkTimeService', () => {
  return {
    EmployeeWorkTimeService: vi.fn().mockImplementation(() => {
      return {
        createWorkTime: mockCreateWorkTime,
        updateWorkHours: mockUpdateWorkHours,
        getWorkTimes: vi.fn().mockResolvedValue([]),
      };
    }),
  };
});

describe('EmployeeWorkTimeForm (US2)', () => {
  const mockEmployees = [
    { id: 'EMP001', name: 'トム・デマルコ', costPerHour: 9000 },
  ];
  const mockAssignments = [
    { id: 'WK001', startDate: '2026-08-15', endDate: '2026-09-30', contractEffort: 1.0, contractPrice: 800000, sales: 800000, cost: 0, grossProfit: 800000, grossProfitRate: 1.0, projectId: 'PJ001', caseId: 'AJ001' },
  ];
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();
  const mockGetMonthlyTotal = vi.fn().mockReturnValue(0);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新規登録モードで正しく表示され、入力値を送信したときに登録サービスが呼ばれること', async () => {
    render(
      <EmployeeWorkTimeForm
        editingItem={null}
        employees={mockEmployees}
        assignments={mockAssignments}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
        getMonthlyTotal={mockGetMonthlyTotal}
      />
    );

    // 要素の存在確認
    expect(screen.getByText('新規工数実績登録')).toBeInTheDocument();

    // 値の入力
    fireEvent.change(screen.getByLabelText(/作業契約/), { target: { value: 'WK001' } });
    fireEvent.change(screen.getByLabelText(/社員/), { target: { value: 'EMP001' } });
    fireEvent.change(screen.getByLabelText(/対象年月/), { target: { value: '2026-08' } });
    fireEvent.change(screen.getByLabelText(/作業時間/), { target: { value: '150' } });

    // 送信
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    // サービスが期待通り呼ばれること
    await waitFor(() => {
      expect(mockCreateWorkTime).toHaveBeenCalledWith({
        caseAssignmentId: 'WK001',
        staffId: 'EMP001',
        targetMonth: '2026-08-01', // フォーム側で自動的に -01 を補完
        workHours: 150,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
