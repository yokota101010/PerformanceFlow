export interface MonthlyCaseDetailCostRowDTO {
  contractId: string;        // 契約ID
  projectId: string;         // プロジェクトID
  projectName: string;       // プロジェクト名
  caseId: string;            // 案件ID
  caseName: string;          // 案件名
  yearMonth: string;         // 年月 (YYYY-MM-01)
  outsourcingCost: number;   // 外注原価 (発注額)
  employeeCost: number;      // 社員加工費
  otherExpenses: number;     // その他経費
  manufacturingCost: number; // 製造原価合計
  fiscalYear: string;        // 会計年度 (YYYY-04-01)
  quarterCategory: string;   // 四半期区分 (1Q | 2Q | 3Q | 4Q)
}

export interface MonthlyCaseDetailCostSummaryDTO {
  rows: MonthlyCaseDetailCostRowDTO[];
  totalManufacturingCost: number;
}

export interface MonthlyCaseDetailCostUseCase {
  execute(filter?: {
    projectId?: string;
    caseId?: string;
    contractId?: string;
    fiscalYear?: string;
    quarterCategory?: string;
  }): Promise<MonthlyCaseDetailCostSummaryDTO>;
}
