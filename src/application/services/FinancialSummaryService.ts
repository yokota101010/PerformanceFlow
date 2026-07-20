import { CaseAssignmentRepository } from '../../domain/repositories/CaseAssignmentRepository';
import { EmployeeWorkTimeRepository } from '../../domain/repositories/EmployeeWorkTimeRepository';
import { PartnerOrderRepository } from '../../domain/repositories/PartnerOrderRepository';
import { OtherExpenseRepository } from '../../domain/repositories/OtherExpenseRepository';
import { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import { CaseRepository } from '../../domain/repositories/CaseRepository';
import {
  FinancialSummaryUseCase,
  FinancialSummaryDTO,
  CaseAssignmentFinancialRowDTO,
  FinancialSummaryFilterInput,
} from '../usecases/FinancialSummaryUseCase';

export class FinancialSummaryService implements FinancialSummaryUseCase {
  constructor(
    private caseAssignmentRepo: CaseAssignmentRepository,
    private employeeWorkTimeRepo: EmployeeWorkTimeRepository,
    private partnerOrderRepo: PartnerOrderRepository,
    private otherExpenseRepo: OtherExpenseRepository,
    private projectRepo: ProjectRepository,
    private caseRepo: CaseRepository
  ) {}

  async execute(filter?: FinancialSummaryFilterInput): Promise<{
    summary: FinancialSummaryDTO;
    rows: CaseAssignmentFinancialRowDTO[];
  }> {
    const assignments = await this.caseAssignmentRepo.findAll();
    const projects = await this.projectRepo.findAll();
    const cases = await this.caseRepo.findAll();

    const projectMap = new Map(projects.map(p => [p.id, p]));
    const caseMap = new Map(cases.map(c => [c.id, c]));

    const filteredRows: CaseAssignmentFinancialRowDTO[] = [];

    for (const assignment of assignments) {
      const project = projectMap.get(assignment.projectId);
      const caseItem = caseMap.get(assignment.caseId);

      const projectName = project ? project.name : '不明なプロジェクト';
      const caseName = caseItem ? caseItem.name : '不明な案件';

      // 1. プロジェクト名フィルター
      if (filter?.projectName) {
        if (!projectName.toLowerCase().includes(filter.projectName.toLowerCase())) {
          continue;
        }
      }

      // 2. 期間フィルター (開始月・終了月)
      const assignStartMonth = assignment.startDate.substring(0, 7); // YYYY-MM
      const assignEndMonth = assignment.endDate.substring(0, 7);     // YYYY-MM

      if (filter?.startMonth) {
        if (assignEndMonth < filter.startMonth) {
          continue;
        }
      }
      if (filter?.endMonth) {
        if (assignStartMonth > filter.endMonth) {
          continue;
        }
      }

      // 3. 各金額の集計
      const sales = assignment.contractEffort * assignment.contractPrice;
      const laborCost = await this.employeeWorkTimeRepo.sumCostByCaseAssignmentId(
        assignment.projectId,
        assignment.id
      );
      const orderCost = await this.partnerOrderRepo.sumByCaseAssignmentId(
        assignment.projectId,
        assignment.id
      );
      const expenseCost = await this.otherExpenseRepo.sumByCaseAssignmentId(
        assignment.projectId,
        assignment.id
      );

      const totalCost = laborCost + orderCost + expenseCost;
      const grossProfit = sales - totalCost;
      const grossProfitRate = sales > 0 ? Math.round((grossProfit / sales) * 100) : 0;
      const isDeficit = grossProfitRate < 0;

      filteredRows.push({
        assignmentId: assignment.id,
        projectName,
        caseName,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        sales,
        laborCost,
        orderCost,
        expenseCost,
        totalCost,
        grossProfit,
        grossProfitRate,
        isDeficit,
      });
    }

    // 全社サマリの集計
    let totalSales = 0;
    let totalCost = 0;

    for (const row of filteredRows) {
      totalSales += row.sales;
      totalCost += row.totalCost;
    }

    const totalGrossProfit = totalSales - totalCost;
    const overallGrossProfitRate = totalSales > 0 ? Math.round((totalGrossProfit / totalSales) * 100) : 0;

    const summary: FinancialSummaryDTO = {
      totalSales,
      totalCost,
      totalGrossProfit,
      overallGrossProfitRate,
    };

    return {
      summary,
      rows: filteredRows,
    };
  }
}
