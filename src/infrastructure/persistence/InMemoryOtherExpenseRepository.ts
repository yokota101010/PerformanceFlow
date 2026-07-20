import { OtherExpenseRepository } from '../../domain/repositories/OtherExpenseRepository';
import { OtherExpense } from '../../domain/models/OtherExpense';

/**
 * その他経費マスタ（経費データ）のインメモリテスト用リポジトリ実装。
 * 初回ロード時に自動的にシードデータをロードする。
 */
export class InMemoryOtherExpenseRepository implements OtherExpenseRepository {
  private items: OtherExpense[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.items = [
      new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 1, amount: 50000, memo: '旅費交通費' }),
      new OtherExpense({ caseAssignmentId: 'WK001', lineNo: 2, amount: 12000, memo: '会議費' }),
      new OtherExpense({ caseAssignmentId: 'WK002', lineNo: 1, amount: 35000, memo: '消耗品費' }),
    ];
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    return this.items.some(x => x.caseAssignmentId === caseAssignmentId);
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    return this.items.filter(x => x.caseAssignmentId === caseAssignmentId);
  }

  async findAll(): Promise<readonly OtherExpense[]> {
    return [...this.items];
  }

  async findByKeys(caseAssignmentId: string, lineNo: number): Promise<OtherExpense | null> {
    const item = this.items.find(x => x.caseAssignmentId === caseAssignmentId && x.lineNo === lineNo);
    return item || null;
  }

  async save(otherExpense: OtherExpense): Promise<void> {
    const index = this.items.findIndex(
      x => x.caseAssignmentId === otherExpense.caseAssignmentId && x.lineNo === otherExpense.lineNo
    );
    if (index >= 0) {
      this.items[index] = otherExpense;
    } else {
      this.items.push(otherExpense);
    }
  }

  async delete(caseAssignmentId: string, lineNo: number): Promise<void> {
    this.items = this.items.filter(
      x => !(x.caseAssignmentId === caseAssignmentId && x.lineNo === lineNo)
    );
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    return this.items
      .filter(x => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.amount, 0);
  }

  async getNextLineNo(caseAssignmentId: string): Promise<number> {
    const filtered = this.items.filter(x => x.caseAssignmentId === caseAssignmentId);
    if (filtered.length === 0) return 1;
    const max = filtered.reduce((m, x) => Math.max(m, x.lineNo), 0);
    return max + 1;
  }

  /**
   * テスト用に金額を書き換えるヘルパー（他機能のテストとの互換性維持のため残す）
   */
  setSum(projectId: string, caseAssignmentId: string, amount: number): void {
    void projectId;
    // 既存のWK-EMP紐付きなどを考慮せず、単一レコードを偽装
    // 金額を丸ごと上書きするか、新規のダミー行として追加
    this.items = this.items.filter(x => x.caseAssignmentId !== caseAssignmentId);
    this.items.push(new OtherExpense({
      caseAssignmentId,
      lineNo: 1,
      amount,
      memo: 'テスト経費'
    }));
  }
}
