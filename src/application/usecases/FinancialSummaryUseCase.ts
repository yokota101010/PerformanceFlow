export interface FinancialSummaryDTO {
  totalSales: number;
  totalCost: number;
  totalGrossProfit: number;
  overallGrossProfitRate: number;
}

export interface CaseAssignmentFinancialRowDTO {
  assignmentId: string;
  projectName: string;
  caseName: string;
  startDate: string;
  endDate: string;
  sales: number;
  laborCost: number;
  orderCost: number;
  expenseCost: number;
  totalCost: number;
  grossProfit: number;
  grossProfitRate: number;
  isDeficit: boolean;
}

export interface FinancialSummaryFilterInput {
  projectName?: string;
  startMonth?: string; // YYYY-MM形式
  endMonth?: string;   // YYYY-MM形式
}

export interface FinancialSummaryUseCase {
  execute(filter?: FinancialSummaryFilterInput): Promise<{
    summary: FinancialSummaryDTO;
    rows: CaseAssignmentFinancialRowDTO[];
  }>;
}
