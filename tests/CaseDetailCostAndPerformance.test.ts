import { describe, it, expect, beforeEach } from 'vitest';
import { MonthlyCaseDetailCost } from '../src/domain/models/MonthlyCaseDetailCost';
import { QuarterlyCaseDetailPerformance } from '../src/domain/models/QuarterlyCaseDetailPerformance';
import { MonthlyCaseDetailCostService } from '../src/application/services/MonthlyCaseDetailCostService';
import { QuarterlyCaseDetailPerformanceService } from '../src/application/services/QuarterlyCaseDetailPerformanceService';
import { RepositoryRegistry } from '../src/infrastructure/persistence/RepositoryRegistry';
import { Project, Case, CaseAssignment, PartnerOrder, OrderDetail, EmployeeWorkTime, EmployeeUnitPrice } from '../src/domain/models';
import { OtherExpense } from '../src/domain/models/OtherExpense';

describe('Domain Models: 月別案件明細原価 & 四半期別案件明細業績', () => {
  it('MonthlyCaseDetailCost should correctly derive fiscalYear, quarterCategory, and manufacturingCost', () => {
    // 2026-08-01 -> 2026年度 2Q
    const costAug = new MonthlyCaseDetailCost(
      'CON001',
      '2026-08-01',
      1300000, // 外注原価
      1600000, // 社員加工費
      15000    // その他経費
    );

    expect(costAug.contractId).toBe('CON001');
    expect(costAug.yearMonth).toBe('2026-08-01');
    expect(costAug.outsourcingCost).toBe(1300000);
    expect(costAug.employeeCost).toBe(1600000);
    expect(costAug.otherExpenses).toBe(15000);
    expect(costAug.manufacturingCost).toBe(2915000); // 1300000 + 1600000 + 15000
    expect(costAug.fiscalYear).toBe('2026-04-01');
    expect(costAug.quarterCategory).toBe('2Q');

    // 2027-01-01 -> 2026年度 4Q (1月は前年会計年度)
    const costJan = new MonthlyCaseDetailCost('CON003', '2027-01-01', 1050000, 1760000, 0);
    expect(costJan.fiscalYear).toBe('2026-04-01');
    expect(costJan.quarterCategory).toBe('4Q');
    expect(costJan.manufacturingCost).toBe(2810000);
  });

  it('QuarterlyCaseDetailPerformance should correctly calculate pro-rated sales, gross profit, and rate', () => {
    // CON001: 総売上 12,000,000, 総製造原価 6,515,000
    // 当期 (2Q) 製造原価 6,515,000
    const perf2Q = new QuarterlyCaseDetailPerformance(
      'CON001',
      '2026-04-01',
      '2Q',
      6515000,
      12000000,
      6515000
    );

    expect(perf2Q.contractId).toBe('CON001');
    expect(perf2Q.fiscalYear).toBe('2026-04-01');
    expect(perf2Q.quarterCategory).toBe('2Q');
    expect(perf2Q.manufacturingCost).toBe(6515000);
    expect(perf2Q.sales).toBe(12000000); // 12000000 * 6515000 / 6515000
    expect(perf2Q.grossProfit).toBe(5485000); // 12000000 - 6515000
    expect(perf2Q.grossProfitRate).toBe(0.46); // 5485000 / 12000000 = 0.457 -> 0.46

    // CON003 分割ケース:
    // 総売上 4,000,000, 総製造原価 11,252,000
    // 3Q 製造原価: 8,442,000
    // 3Q 売上按分: 4,000,000 * 8,442,000 / 11,252,000 = 3,001,066.47 -> 3,001,066
    const perf3Q = new QuarterlyCaseDetailPerformance(
      'CON003',
      '2026-04-01',
      '3Q',
      8442000,
      4000000,
      11252000
    );
    expect(perf3Q.sales).toBe(3001066);
    expect(perf3Q.manufacturingCost).toBe(8442000);
    expect(perf3Q.grossProfit).toBe(-5440934); // 赤字ケース
    expect(perf3Q.grossProfitRate).toBe(-1.81);
  });
});

describe('Query Services (On-Demand Projections: F15 & F16)', () => {
  beforeEach(async () => {
    // LocalStorage を全クリア
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // リポジトリ初期化
    const projectRepo = RepositoryRegistry.getProjectRepository();
    const caseRepo = RepositoryRegistry.getCaseRepository();
    const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const orderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const unitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();
    const expenseRepo = RepositoryRegistry.getOtherExpenseRepository();

    // domain-model.md の AI検証用シードデータを登録
    // プロジェクト PJ001
    await projectRepo.save(new Project('PJ001', '基幹基盤システム刷新プロジェクト'));

    // 案件 ANK001
    await caseRepo.save(new Case('PJ001', 'ANK001', '要件定義・設計フェーズ', '2026-08-15', '2026-11-15'));

    // 案件明細 CON001 (売上 12,000,000, 契約工数 10.0, 契約単価 1,200,000, 製造原価 6,515,000)
    await assignmentRepo.save(
      new CaseAssignment('PJ001', 'CON001', 'ANK001', '2026-08-15', '2026-09-30', 10.0, 1200000, 6515000)
    );

    // 社員単価 EMP001 (2026-04-01〜: 10,000円/h)
    await unitPriceRepo.save(
      new EmployeeUnitPrice('EUP001', 'EMP001', [
        { unitPriceId: 'EUP001', startYearMonth: '2026-04', price: 10000 },
      ])
    );

    // 発注 ORD001 (CON001, 2026-08-01, 1,300,000円)
    await orderRepo.save(
      new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', [
        new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
        new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001'),
      ])
    );
    // 発注 ORD002 (CON001, 2026-09-01, 2,000,000円)
    await orderRepo.save(
      new PartnerOrder('ORD002', 'CON001', 'BP001', '2026-09-01', [
        new OrderDetail('ORD002', 'MEM001', 1.0, 1000000, '2026-09-01', 'BP001', 'BP001'),
        new OrderDetail('ORD002', 'MEM002', 1.0, 1000000, '2026-09-01', 'BP001', 'BP001'),
      ])
    );

    // 社員工数 CON001, EMP001 (2026-08-01: 160h * 10,000 = 1,600,000)
    await workTimeRepo.save(
      new EmployeeWorkTime({
        caseAssignmentId: 'CON001',
        staffId: 'EMP001',
        targetMonth: '2026-08-01',
        workHours: 160,
        staffPrice: 10000,
      })
    );
    // 社員工数 CON001, EMP001 (2026-09-01: 160h * 10,000 = 1,600,000)
    await workTimeRepo.save(
      new EmployeeWorkTime({
        caseAssignmentId: 'CON001',
        staffId: 'EMP001',
        targetMonth: '2026-09-01',
        workHours: 160,
        staffPrice: 10000,
      })
    );

    // その他経費 CON001 (2026-08-20, 15,000円)
    await expenseRepo.save(
      new OtherExpense({
        caseAssignmentId: 'CON001',
        occurrenceDate: '2026-08-20',
        lineNo: 1,
        amount: 15000,
        memo: 'クラウド利用料',
      })
    );
  });

  it('F15: MonthlyCaseDetailCostService should calculate on-demand cost matching domain-model.md test data', async () => {
    const service = new MonthlyCaseDetailCostService();
    const result = await service.execute({ contractId: 'CON001' });

    expect(result.rows).toHaveLength(2);

    // 2026-08-01 行の検証: 外注 1,300,000 + 社員 1,600,000 + 経費 15,000 = 2,915,000
    const rowAug = result.rows.find((r) => r.yearMonth === '2026-08-01');
    expect(rowAug).toBeDefined();
    expect(rowAug?.outsourcingCost).toBe(1300000);
    expect(rowAug?.employeeCost).toBe(1600000);
    expect(rowAug?.otherExpenses).toBe(15000);
    expect(rowAug?.manufacturingCost).toBe(2915000);
    expect(rowAug?.fiscalYear).toBe('2026-04-01');
    expect(rowAug?.quarterCategory).toBe('2Q');

    // 2026-09-01 行の検証: 外注 2,000,000 + 社員 1,600,000 = 3,600,000
    const rowSep = result.rows.find((r) => r.yearMonth === '2026-09-01');
    expect(rowSep).toBeDefined();
    expect(rowSep?.outsourcingCost).toBe(2000000);
    expect(rowSep?.employeeCost).toBe(1600000);
    expect(rowSep?.otherExpenses).toBe(0);
    expect(rowSep?.manufacturingCost).toBe(3600000);
    expect(rowSep?.fiscalYear).toBe('2026-04-01');
    expect(rowSep?.quarterCategory).toBe('2Q');

    // 総製造原価合計: 2,915,000 + 3,600,000 = 6,515,000
    expect(result.totalManufacturingCost).toBe(6515000);
  });

  it('F16: QuarterlyCaseDetailPerformanceService should calculate on-demand performance matching domain-model.md', async () => {
    const service = new QuarterlyCaseDetailPerformanceService();
    const result = await service.execute({ contractId: 'CON001' });

    expect(result.rows).toHaveLength(1);

    const perf2Q = result.rows[0];
    expect(perf2Q.contractId).toBe('CON001');
    expect(perf2Q.fiscalYear).toBe('2026-04-01');
    expect(perf2Q.quarterCategory).toBe('2Q');
    expect(perf2Q.manufacturingCost).toBe(6515000);
    expect(perf2Q.sales).toBe(12000000);
    expect(perf2Q.grossProfit).toBe(5485000);
    expect(perf2Q.grossProfitRate).toBe(0.46);

    expect(result.totalSales).toBe(12000000);
    expect(result.totalManufacturingCost).toBe(6515000);
    expect(result.totalGrossProfit).toBe(5485000);
    expect(result.overallGrossProfitRate).toBe(0.46);
  });
});
