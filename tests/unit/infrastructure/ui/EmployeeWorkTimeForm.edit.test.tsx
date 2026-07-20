import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeWorkTimeForm } from '../../../../src/infrastructure/ui/EmployeeWorkTimeForm';
import { EmployeeWorkTime } from '../../../../src/domain/models/EmployeeWorkTime';

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

describe('EmployeeWorkTimeForm - Edit Mode (US3)', () => {
  const mockEmployees = [
    { id: 'EMP001', name: 'トム・デマルコ', costPerHour: 9000 },
  ];
  const mockAssignments = [
    { id: 'WK001', startDate: '2026-08-15', endDate: '2026-09-30', contractEffort: 1.0, contractPrice: 800000, sales: 800000, cost: 0, grossProfit: 800000, grossProfitRate: 1.0, projectId: 'PJ001', caseId: 'AJ001' },
  ];
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();
  const mockGetMonthlyTotal = vi.fn().mockReturnValue(160);

  const existingItem = new EmployeeWorkTime({
    caseAssignmentId: 'WK001',
    staffId: 'EMP001',
    targetMonth: '2026-08-01',
    workHours: 160,
    staffPrice: 9000,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('編集モードで正しく初期表示され、変更不可フィールドがdisabledになり、送信時に更新サービスが呼ばれること', async () => {
    render(
      <EmployeeWorkTimeForm
        editingItem={existingItem}
        employees={mockEmployees}
        assignments={mockAssignments}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
        getMonthlyTotal={mockGetMonthlyTotal}
      />
    );

    expect(screen.getByText('工数実績編集')).toBeInTheDocument();

    // 複合キーフィールドが disabled になっているか確認
    expect(screen.getByLabelText(/作業契約/)).toBeDisabled();
    expect(screen.getByLabelText(/社員/)).toBeDisabled();
    expect(screen.getByLabelText(/対象年月/)).toBeDisabled();

    // 作業時間を変更
    fireEvent.change(screen.getByLabelText(/作業時間/), { target: { value: '120' } });

    // 保存ボタンクリック
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(mockUpdateWorkHours).toHaveBeenCalledWith({
        caseAssignmentId: 'WK001',
        staffId: 'EMP001',
        targetMonth: '2026-08-01',
        workHours: 120,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
