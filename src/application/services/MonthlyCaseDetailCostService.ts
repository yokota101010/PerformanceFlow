import {
  MonthlyCaseDetailCostUseCase,
  MonthlyCaseDetailCostSummaryDTO,
  MonthlyCaseDetailCostRowDTO,
} from '../usecases/MonthlyCaseDetailCostUseCase';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import { MonthlyCaseDetailCost } from '../../domain/models/MonthlyCaseDetailCost';

export class MonthlyCaseDetailCostService implements MonthlyCaseDetailCostUseCase {
  async execute(filter?: {
    projectId?: string;
    caseId?: string;
    contractId?: string;
    fiscalYear?: string;
    quarterCategory?: string;
  }): Promise<MonthlyCaseDetailCostSummaryDTO> {
    const projectRepo = RepositoryRegistry.getProjectRepository();
    const caseRepo = RepositoryRegistry.getCaseRepository();
    const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const orderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const employeeUnitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();
    const expenseRepo = RepositoryRegistry.getOtherExpenseRepository();

    const [projects, cases, assignments, orders, workTimes, employeeUnitPrices, expenses] = await Promise.all([
      projectRepo.findAll(),
      caseRepo.findAll(),
      assignmentRepo.findAll(),
      orderRepo.findAll(),
      workTimeRepo.findAll(),
      employeeUnitPriceRepo.findAll(),
      expenseRepo.findAll(),
    ]);

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    const caseMap = new Map(cases.map((c) => [`${c.projectId}:${c.id}`, c.name]));

    // 契約ID × 年月ごとの集計マップ
    // key: `${contractId}:${normalizedYearMonth}`
    const costMap = new Map<
      string,
      {
        contractId: string;
        yearMonth: string;
        outsourcingCost: number;
        employeeCost: number;
        otherExpenses: number;
      }
    >();

    const getOrCreateCostEntry = (contractId: string, ym: string) => {
      const normalizedYM = ym.length === 7 ? `${ym}-01` : ym;
      const key = `${contractId}:${normalizedYM}`;
      let entry = costMap.get(key);
      if (!entry) {
        entry = {
          contractId,
          yearMonth: normalizedYM,
          outsourcingCost: 0,
          employeeCost: 0,
          otherExpenses: 0,
        };
        costMap.set(key, entry);
      }
      return entry;
    };

    // 1. 発注 (外注原価) の集約
    for (const order of orders) {
      if (!order.caseAssignmentId || !order.targetMonth) continue;
      const entry = getOrCreateCostEntry(order.caseAssignmentId, order.targetMonth);
      entry.outsourcingCost += order.totalAmount || 0;
    }

    // 2. 社員工数 (加工費) の集約
    for (const wt of workTimes) {
      if (!wt.caseAssignmentId || !wt.targetMonth) continue;
      const entry = getOrCreateCostEntry(wt.caseAssignmentId, wt.targetMonth);
      // 単価がエンティティ側または計算済みの場合はそれを使用、なければ社員単価集約からルックアップ
      let cost = wt.laborCost;
      if (!cost && wt.workHours > 0) {
        const up = employeeUnitPrices.find((p) => p.employeeId === wt.staffId);
        const unitPrice = up ? up.getPriceForMonth(wt.targetMonth.substring(0, 7)) : 0;
        cost = wt.workHours * unitPrice;
      }
      entry.employeeCost += cost || 0;
    }

    // 案件明細（契約）ごとの親情報ルックアップ
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // 3. その他経費 の集約
    for (const exp of expenses) {
      if (!exp.caseAssignmentId) continue;
      const assignment = assignmentMap.get(exp.caseAssignmentId);
      // 発生日または年月から年月を導出。なければ契約の開始年月
      const expYM =
        (exp as any).occurrenceYearMonth ||
        (exp as any).occurredDate ||
        (exp as any).targetMonth ||
        (assignment ? assignment.startDate.substring(0, 7) + '-01' : '2026-08-01');
      const entry = getOrCreateCostEntry(exp.caseAssignmentId, expYM);
      entry.otherExpenses += exp.amount || 0;
    }

    const rows: MonthlyCaseDetailCostRowDTO[] = [];

    costMap.forEach((entry) => {
      const assignment = assignmentMap.get(entry.contractId);
      const projectId = assignment ? assignment.projectId : '';
      const caseId = assignment ? assignment.caseId : '';
      const projectName = projectMap.get(projectId) || projectId;
      const caseName = caseMap.get(`${projectId}:${caseId}`) || caseId;

      const domainModel = new MonthlyCaseDetailCost(
        entry.contractId,
        entry.yearMonth,
        entry.outsourcingCost,
        entry.employeeCost,
        entry.otherExpenses
      );

      // フィルタリング処理
      if (filter) {
        if (filter.projectId && projectId !== filter.projectId) return;
        if (filter.caseId && caseId !== filter.caseId) return;
        if (filter.contractId && entry.contractId !== filter.contractId) return;
        if (filter.fiscalYear && domainModel.fiscalYear !== filter.fiscalYear) return;
        if (filter.quarterCategory && domainModel.quarterCategory !== filter.quarterCategory) return;
      }

      rows.push({
        contractId: entry.contractId,
        projectId,
        projectName,
        caseId,
        caseName,
        yearMonth: domainModel.yearMonth,
        outsourcingCost: domainModel.outsourcingCost,
        employeeCost: domainModel.employeeCost,
        otherExpenses: domainModel.otherExpenses,
        manufacturingCost: domainModel.manufacturingCost,
        fiscalYear: domainModel.fiscalYear,
        quarterCategory: domainModel.quarterCategory,
      });
    });

    // 契約ID昇順、年月昇順でソート
    rows.sort((a, b) => {
      const cmpContract = a.contractId.localeCompare(b.contractId);
      if (cmpContract !== 0) return cmpContract;
      return a.yearMonth.localeCompare(b.yearMonth);
    });

    const totalManufacturingCost = rows.reduce((sum, r) => sum + r.manufacturingCost, 0);

    return {
      rows,
      totalManufacturingCost,
    };
  }
}
