import {
  QuarterlyCaseDetailPerformanceUseCase,
  QuarterlyCaseDetailPerformanceSummaryDTO,
  QuarterlyCaseDetailPerformanceRowDTO,
} from '../usecases/QuarterlyCaseDetailPerformanceUseCase';
import { MonthlyCaseDetailCostService } from './MonthlyCaseDetailCostService';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import { QuarterlyCaseDetailPerformance } from '../../domain/models/QuarterlyCaseDetailPerformance';

export class QuarterlyCaseDetailPerformanceService implements QuarterlyCaseDetailPerformanceUseCase {
  constructor(private readonly monthlyCostService: MonthlyCaseDetailCostService = new MonthlyCaseDetailCostService()) {}

  async execute(filter?: {
    projectId?: string;
    caseId?: string;
    contractId?: string;
    fiscalYear?: string;
    quarterCategory?: string;
  }): Promise<QuarterlyCaseDetailPerformanceSummaryDTO> {
    const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const projectRepo = RepositoryRegistry.getProjectRepository();
    const caseRepo = RepositoryRegistry.getCaseRepository();

    const [assignments, projects, cases] = await Promise.all([
      assignmentRepo.findAll(),
      projectRepo.findAll(),
      caseRepo.findAll(),
    ]);

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    const caseMap = new Map(cases.map((c) => [`${c.projectId}:${c.id}`, c.name]));
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // 全ての月別原価を取得（契約単位の総製造原価を算出するため、フィルタなしで一度取得）
    const allMonthlyCosts = await this.monthlyCostService.execute();

    // 契約IDごとの総製造原価を事前集計
    const totalManufacturingCostByContract = new Map<string, number>();
    for (const row of allMonthlyCosts.rows) {
      const cur = totalManufacturingCostByContract.get(row.contractId) || 0;
      totalManufacturingCostByContract.set(row.contractId, cur + row.manufacturingCost);
    }

    // (契約ID + 会計年度 + 四半期区分) ごとの製造原価集計マップ
    // key: `${contractId}:${fiscalYear}:${quarterCategory}`
    const quarterCostMap = new Map<
      string,
      {
        contractId: string;
        fiscalYear: string;
        quarterCategory: string;
        manufacturingCost: number;
      }
    >();

    for (const row of allMonthlyCosts.rows) {
      const key = `${row.contractId}:${row.fiscalYear}:${row.quarterCategory}`;
      const entry = quarterCostMap.get(key) || {
        contractId: row.contractId,
        fiscalYear: row.fiscalYear,
        quarterCategory: row.quarterCategory,
        manufacturingCost: 0,
      };
      entry.manufacturingCost += row.manufacturingCost;
      quarterCostMap.set(key, entry);
    }

    const rows: QuarterlyCaseDetailPerformanceRowDTO[] = [];

    quarterCostMap.forEach((entry) => {
      const assignment = assignmentMap.get(entry.contractId);
      const projectId = assignment ? assignment.projectId : '';
      const caseId = assignment ? assignment.caseId : '';
      const projectName = projectMap.get(projectId) || projectId;
      const caseName = caseMap.get(`${projectId}:${caseId}`) || caseId;

      // フィルタリング処理
      if (filter) {
        if (filter.projectId && projectId !== filter.projectId) return;
        if (filter.caseId && caseId !== filter.caseId) return;
        if (filter.contractId && entry.contractId !== filter.contractId) return;
        if (filter.fiscalYear && entry.fiscalYear !== filter.fiscalYear) return;
        if (filter.quarterCategory && entry.quarterCategory !== filter.quarterCategory) return;
      }

      // 総売上と総製造原価の取得
      const totalSales = assignment ? assignment.sales || assignment.contractEffort * assignment.contractPrice : 0;
      const totalCost = totalManufacturingCostByContract.get(entry.contractId) || (assignment ? assignment.cost : 0) || 0;

      // ドメイン集約クラスを通じて売上・粗利・粗利率を算出
      const performance = new QuarterlyCaseDetailPerformance(
        entry.contractId,
        entry.fiscalYear,
        entry.quarterCategory,
        entry.manufacturingCost,
        totalSales,
        totalCost
      );

      rows.push({
        contractId: entry.contractId,
        projectId,
        projectName,
        caseId,
        caseName,
        fiscalYear: performance.fiscalYear,
        quarterCategory: performance.quarterCategory,
        sales: performance.sales,
        manufacturingCost: performance.manufacturingCost,
        grossProfit: performance.grossProfit,
        grossProfitRate: performance.grossProfitRate,
      });
    });

    // ソート: 契約ID昇順、年度昇順、四半期昇順
    rows.sort((a, b) => {
      const cmpContract = a.contractId.localeCompare(b.contractId);
      if (cmpContract !== 0) return cmpContract;
      const cmpFY = a.fiscalYear.localeCompare(b.fiscalYear);
      if (cmpFY !== 0) return cmpFY;
      return a.quarterCategory.localeCompare(b.quarterCategory);
    });

    const totalSales = rows.reduce((sum, r) => sum + r.sales, 0);
    const totalManufacturingCost = rows.reduce((sum, r) => sum + r.manufacturingCost, 0);
    const totalGrossProfit = rows.reduce((sum, r) => sum + r.grossProfit, 0);
    const overallGrossProfitRate = totalSales > 0 ? Math.round((totalGrossProfit / totalSales) * 100) / 100 : 0.0;

    return {
      rows,
      totalSales,
      totalManufacturingCost,
      totalGrossProfit,
      overallGrossProfitRate,
    };
  }
}
