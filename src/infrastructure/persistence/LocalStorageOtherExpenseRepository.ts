import { OtherExpenseRepository } from '../../domain/repositories/OtherExpenseRepository';
import { OtherExpense } from '../../domain/models/OtherExpense';

interface StorageItem {
  caseAssignmentId: string;
  lineNo: number;
  amount: number;
  memo: string;
}

/**
 * 本番環境（ブラウザ完結型SPA）で用いる LocalStorage 永続化その他経費リポジトリ実装。
 */
export class LocalStorageOtherExpenseRepository implements OtherExpenseRepository {
  private readonly STORAGE_KEY = 'performance_flow_other_expenses';

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const seed: StorageItem[] = [
        { caseAssignmentId: 'WK001', lineNo: 1, amount: 50000, memo: '旅費交通費' },
        { caseAssignmentId: 'WK001', lineNo: 2, amount: 12000, memo: '会議費' },
        { caseAssignmentId: 'WK002', lineNo: 1, amount: 35000, memo: '消耗品費' },
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
    }
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    const list = await this.findAll();
    return list.some(x => x.caseAssignmentId === caseAssignmentId);
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    const list = await this.findAll();
    return list.filter(x => x.caseAssignmentId === caseAssignmentId);
  }

  async findAll(): Promise<readonly OtherExpense[]> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return [];
    const rawItems: StorageItem[] = JSON.parse(dataStr);
    return rawItems.map(raw => new OtherExpense(raw));
  }

  async findByKeys(caseAssignmentId: string, lineNo: number): Promise<OtherExpense | null> {
    const list = await this.findAll();
    return list.find(x => x.caseAssignmentId === caseAssignmentId && x.lineNo === lineNo) || null;
  }

  async save(otherExpense: OtherExpense): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    const rawItems: StorageItem[] = dataStr ? JSON.parse(dataStr) : [];
    const idx = rawItems.findIndex(
      x => x.caseAssignmentId === otherExpense.caseAssignmentId && x.lineNo === otherExpense.lineNo
    );

    const itemToSave: StorageItem = {
      caseAssignmentId: otherExpense.caseAssignmentId,
      lineNo: otherExpense.lineNo,
      amount: otherExpense.amount,
      memo: otherExpense.memo,
    };

    if (idx >= 0) {
      rawItems[idx] = itemToSave;
    } else {
      rawItems.push(itemToSave);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rawItems));
  }

  async delete(caseAssignmentId: string, lineNo: number): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return;
    const rawItems: StorageItem[] = JSON.parse(dataStr);
    const filtered = rawItems.filter(
      x => !(x.caseAssignmentId === caseAssignmentId && x.lineNo === lineNo)
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const list = await this.findAll();
    return list
      .filter(x => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.amount, 0);
  }

  async getNextLineNo(caseAssignmentId: string): Promise<number> {
    const list = await this.findAll();
    const filtered = list.filter(x => x.caseAssignmentId === caseAssignmentId);
    if (filtered.length === 0) return 1;
    const max = filtered.reduce((m, x) => Math.max(m, x.lineNo), 0);
    return max + 1;
  }
}
