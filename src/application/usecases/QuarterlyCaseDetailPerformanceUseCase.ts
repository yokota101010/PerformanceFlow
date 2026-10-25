export interface QuarterlyCaseDetailPerformanceRowDTO {
  contractId: string;        // 契約ID
  projectId: string;         // プロジェクトID
  projectName: string;       // プロジェクト名
  caseId: string;            // 案件ID
  caseName: string;          // 案件名
  fiscalYear: string;        // 会計年度 (YYYY-04-01)
  quarterCategory: string;   // 四半期区分 (1Q | 2Q | 3Q | 4Q)
  sales: number;             // 四半期売上
  manufacturingCost: number; // 四半期製造原価
  grossProfit: number;       // 粗利
  grossProfitRate: number;   // 粗利率 (例: 0.46)
}

export interface QuarterlyCaseDetailPerformanceSummaryDTO {
  rows: QuarterlyCaseDetailPerformanceRowDTO[];
  totalSales: number;
  totalManufacturingCost: number;
  totalGrossProfit: number;
  overallGrossProfitRate: number;
}

export interface QuarterlyCaseDetailPerformanceUseCase {
  execute(filter?: {
    projectId?: string;
    caseId?: string;
    contractId?: string;
    fiscalYear?: string;
    quarterCategory?: string;
  }): Promise<QuarterlyCaseDetailPerformanceSummaryDTO>;
}
