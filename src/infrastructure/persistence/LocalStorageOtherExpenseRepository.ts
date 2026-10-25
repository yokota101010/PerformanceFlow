import { OtherExpenseRepository } from '../../domain/repositories/OtherExpenseRepository';
import { OtherExpense } from '../../domain/models/OtherExpense';
import { RepositoryRegistry } from './RepositoryRegistry';

interface RawStorageItem {
  caseAssignmentId: string;
  occurrenceDate?: string;
  lineNo: number;
  amount: number;
  memo: string;
  needsReview?: boolean;
}

interface StorageItem {
  caseAssignmentId: string;
  occurrenceDate: string;
  lineNo: number;
  amount: number;
  memo: string;
  needsReview?: boolean;
}

/**
 * 本番環境（ブラウザ完結型SPA）で用いる LocalStorage 永続化その他経費リポジトリ実装。
 * 旧形式データ（occurrenceDateなし）の起動時自動移行（US4）を内包する。
 */
export class LocalStorageOtherExpenseRepository implements OtherExpenseRepository {
  private readonly STORAGE_KEY = 'performance_flow_other_expenses';
  private migrationExecuted = false;

  constructor() {}

  /**
   * 旧形式データが存在する場合、案件明細の開始日を仮の発生日として新形式に自動移行する
   */
  private async migrateLegacyDataIfNeeded(): Promise<StorageItem[]> {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return [];

    let rawItems: RawStorageItem[];
    try {
      rawItems = JSON.parse(dataStr);
      if (!Array.isArray(rawItems)) return [];
    } catch {
      return [];
    }

    const hasLegacy = rawItems.some((item) => !item.occurrenceDate);
    if (!hasLegacy && this.migrationExecuted) {
      return rawItems as StorageItem[];
    }

    // 移行処理の実行
    let assignments: readonly { id: string; startDate: string }[] = [];
    try {
      const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
      assignments = await assignmentRepo.findAll();
    } catch {
      // リポジトリ初期化前等のフォールバック
    }
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    const migratedList: StorageItem[] = [];
    // 契約ごとにグループ化して処理
    const contractGroups = new Map<string, RawStorageItem[]>();
    for (const item of rawItems) {
      const list = contractGroups.get(item.caseAssignmentId) || [];
      list.push(item);
      contractGroups.set(item.caseAssignmentId, list);
    }

    contractGroups.forEach((items, contractId) => {
      const assignment = assignmentMap.get(contractId);
      const defaultDate = assignment ? assignment.startDate : '';

      // 旧行Noの昇順でソート
      items.sort((a, b) => a.lineNo - b.lineNo);

      // 日付ごとの最大行Noを追跡
      const lineNoCountByDate = new Map<string, number>();

      for (const item of items) {
        if (item.occurrenceDate) {
          // すでに新形式の場合
          const currentCount = lineNoCountByDate.get(item.occurrenceDate) || 0;
          lineNoCountByDate.set(item.occurrenceDate, Math.max(currentCount, item.lineNo));
          migratedList.push({
            caseAssignmentId: item.caseAssignmentId,
            occurrenceDate: item.occurrenceDate,
            lineNo: item.lineNo,
            amount: item.amount,
            memo: item.memo,
            needsReview: item.needsReview,
          });
        } else if (defaultDate) {
          // 旧形式で案件明細が存在する場合: 仮の発生日を設定して移行
          const currentMax = lineNoCountByDate.get(defaultDate) || 0;
          const nextLineNo = currentMax + 1;
          lineNoCountByDate.set(defaultDate, nextLineNo);

          migratedList.push({
            caseAssignmentId: item.caseAssignmentId,
            occurrenceDate: defaultDate,
            lineNo: nextLineNo,
            amount: item.amount,
            memo: item.memo,
            needsReview: true, // 要確認フラグ
          });
        } else {
          // 案件明細が見つからない旧形式経費は移行スキップ
          console.warn(`[OtherExpense Migration] 案件明細が見つからないため移行をスキップ: ${contractId}, lineNo: ${item.lineNo}`);
        }
      }
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedList));
    this.migrationExecuted = true;
    return migratedList;
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    const list = await this.findAll();
    return list.some((x) => x.caseAssignmentId === caseAssignmentId);
  }

  async findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    const list = await this.findAll();
    return list.filter((x) => x.caseAssignmentId === caseAssignmentId);
  }

  async findAll(): Promise<readonly OtherExpense[]> {
    const items = await this.migrateLegacyDataIfNeeded();
    return items.map((raw) => new OtherExpense(raw));
  }

  async findByKeys(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<OtherExpense | null> {
    const list = await this.findAll();
    if (typeof occurrenceDateOrLineNo === 'string' && typeof lineNo === 'number') {
      return (
        list.find(
          (x) => x.caseAssignmentId === caseAssignmentId && x.occurrenceDate === occurrenceDateOrLineNo && x.lineNo === lineNo
        ) || null
      );
    }
    const targetLineNo = typeof occurrenceDateOrLineNo === 'number' ? occurrenceDateOrLineNo : lineNo;
    return list.find((x) => x.caseAssignmentId === caseAssignmentId && x.lineNo === targetLineNo) || null;
  }

  async save(otherExpense: OtherExpense): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    const rawItems: StorageItem[] = dataStr ? JSON.parse(dataStr) : [];
    const idx = rawItems.findIndex(
      (x) =>
        x.caseAssignmentId === otherExpense.caseAssignmentId &&
        x.occurrenceDate === otherExpense.occurrenceDate &&
        x.lineNo === otherExpense.lineNo
    );

    const itemToSave: StorageItem = {
      caseAssignmentId: otherExpense.caseAssignmentId,
      occurrenceDate: otherExpense.occurrenceDate,
      lineNo: otherExpense.lineNo,
      amount: otherExpense.amount,
      memo: otherExpense.memo,
      needsReview: otherExpense.needsReview,
    };

    if (idx >= 0) {
      rawItems[idx] = itemToSave;
    } else {
      rawItems.push(itemToSave);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rawItems));
  }

  async delete(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return;
    const rawItems: StorageItem[] = JSON.parse(dataStr);

    let filtered: StorageItem[];
    if (typeof occurrenceDateOrLineNo === 'string' && typeof lineNo === 'number') {
      filtered = rawItems.filter(
        (x) =>
          !(x.caseAssignmentId === caseAssignmentId && x.occurrenceDate === occurrenceDateOrLineNo && x.lineNo === lineNo)
      );
    } else {
      const targetLineNo = typeof occurrenceDateOrLineNo === 'number' ? occurrenceDateOrLineNo : lineNo;
      filtered = rawItems.filter(
        (x) => !(x.caseAssignmentId === caseAssignmentId && x.lineNo === targetLineNo)
      );
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  async sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const list = await this.findAll();
    return list
      .filter((x) => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.amount, 0);
  }

  async getNextLineNo(caseAssignmentId: string, occurrenceDate?: string): Promise<number> {
    const list = await this.findAll();
    const filtered = list.filter((x) => {
      if (x.caseAssignmentId !== caseAssignmentId) return false;
      if (occurrenceDate && x.occurrenceDate !== occurrenceDate) return false;
      return true;
    });
    if (filtered.length === 0) return 1;
    const max = filtered.reduce((m, x) => Math.max(m, x.lineNo), 0);
    return max + 1;
  }
}
