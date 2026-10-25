import { OtherExpenseRepository } from '../../domain/repositories/OtherExpenseRepository';
import { OtherExpense } from '../../domain/models/OtherExpense';

/**
 * その他経費マスタ（経費データ）のインメモリテスト用リポジトリ実装。
 */
export class InMemoryOtherExpenseRepository implements OtherExpenseRepository {
  private items: OtherExpense[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.items = [];
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    return this.items.some((x) => x.caseAssignmentId === caseAssignmentId);
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    return this.items.filter((x) => x.caseAssignmentId === caseAssignmentId);
  }

  async findAll(): Promise<readonly OtherExpense[]> {
    return [...this.items];
  }

  async findByKeys(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<OtherExpense | null> {
    if (typeof occurrenceDateOrLineNo === 'string' && typeof lineNo === 'number') {
      const item = this.items.find(
        (x) => x.caseAssignmentId === caseAssignmentId && x.occurrenceDate === occurrenceDateOrLineNo && x.lineNo === lineNo
      );
      return item || null;
    }
    const targetLineNo = typeof occurrenceDateOrLineNo === 'number' ? occurrenceDateOrLineNo : lineNo;
    const item = this.items.find((x) => x.caseAssignmentId === caseAssignmentId && x.lineNo === targetLineNo);
    return item || null;
  }

  async save(otherExpense: OtherExpense): Promise<void> {
    const index = this.items.findIndex(
      (x) =>
        x.caseAssignmentId === otherExpense.caseAssignmentId &&
        x.occurrenceDate === otherExpense.occurrenceDate &&
        x.lineNo === otherExpense.lineNo
    );
    if (index >= 0) {
      this.items[index] = otherExpense;
    } else {
      this.items.push(otherExpense);
    }
  }

  async delete(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<void> {
    if (typeof occurrenceDateOrLineNo === 'string' && typeof lineNo === 'number') {
      this.items = this.items.filter(
        (x) =>
          !(x.caseAssignmentId === caseAssignmentId && x.occurrenceDate === occurrenceDateOrLineNo && x.lineNo === lineNo)
      );
      return;
    }
    const targetLineNo = typeof occurrenceDateOrLineNo === 'number' ? occurrenceDateOrLineNo : lineNo;
    this.items = this.items.filter(
      (x) => !(x.caseAssignmentId === caseAssignmentId && x.lineNo === targetLineNo)
    );
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    return this.items
      .filter((x) => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.amount, 0);
  }

  async getNextLineNo(caseAssignmentId: string, occurrenceDate?: string): Promise<number> {
    const filtered = this.items.filter((x) => {
      if (x.caseAssignmentId !== caseAssignmentId) return false;
      if (occurrenceDate && x.occurrenceDate !== occurrenceDate) return false;
      return true;
    });
    if (filtered.length === 0) return 1;
    const max = filtered.reduce((m, x) => Math.max(m, x.lineNo), 0);
    return max + 1;
  }

  /**
   * テスト用に金額を書き換えるヘルパー
   */
  setSum(projectId: string, caseAssignmentId: string, amount: number): void {
    void projectId;
    this.items = this.items.filter((x) => x.caseAssignmentId !== caseAssignmentId);
    this.items.push(
      new OtherExpense({
        caseAssignmentId,
        occurrenceDate: '2026-08-01',
        lineNo: 1,
        amount,
        memo: 'テスト経費',
      })
    );
  }
}
