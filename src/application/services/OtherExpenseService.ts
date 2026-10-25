import { OtherExpenseUseCase, CreateOtherExpenseCommand, UpdateOtherExpenseCommand } from '../usecases/OtherExpenseUseCase';
import { OtherExpense } from '../../domain/models/OtherExpense';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

/**
 * その他経費ユースケースの具象アプリケーションサービス。
 * 正本 domain-model.md（主キー: 契約ID ＋ 発生日 ＋ 行No）および US1〜US4 に準拠。
 */
export class OtherExpenseService implements OtherExpenseUseCase {
  async getOtherExpenses(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const list = await repo.findByCaseAssignmentId(caseAssignmentId);

    // 発生日昇順、同一日は lineNo 昇順にソートして返却 (US2)
    return [...list].sort((a, b) => {
      const dateA = a.occurrenceDate || '';
      const dateB = b.occurrenceDate || '';
      const cmpDate = dateA.localeCompare(dateB);
      if (cmpDate !== 0) return cmpDate;
      return a.lineNo - b.lineNo;
    });
  }

  async createOtherExpense(command: CreateOtherExpenseCommand): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();

    // 1. アサイン契約存在チェック (FR-006)
    const assigns = await assignRepo.findAll();
    const assign = assigns.find((a) => a.id === command.caseAssignmentId);
    if (!assign) {
      throw new Error('指定された作業契約が存在しません。');
    }

    if (command.occurrenceDate === '') {
      throw new Error('発生日は必須です。');
    }

    const occurrenceDate = command.occurrenceDate || assign.startDate || '2026-08-15';

    // 2. 同一契約・同一発生日での自動採番 (FR-004)
    const lineNo = await repo.getNextLineNo(command.caseAssignmentId, occurrenceDate);

    // 3. ドメインオブジェクト生成（実在日バリデーション実行） (FR-001〜FR-008)
    const otherExpense = new OtherExpense({
      caseAssignmentId: command.caseAssignmentId,
      occurrenceDate,
      lineNo,
      amount: command.amount,
      memo: command.memo,
    });

    await repo.save(otherExpense);
  }

  async updateOtherExpense(command: UpdateOtherExpenseCommand): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();

    if (command.occurrenceDate === '') {
      throw new Error('発生日は必須です。');
    }

    const targetDate = command.occurrenceDate || '2026-08-15';
    const oldDate = command.oldOccurrenceDate || targetDate;

    // 1. 存在チェック
    const existing = await repo.findByKeys(command.caseAssignmentId, oldDate, command.lineNo);
    if (!existing) {
      throw new Error('対象の経費データが存在しません。');
    }

    // 2. 発生日が変わらない場合: 金額・摘要の更新（行Noは維持、needsReviewは解除） (US3/US4)
    if (oldDate === targetDate) {
      const updated = new OtherExpense({
        caseAssignmentId: command.caseAssignmentId,
        occurrenceDate: targetDate,
        lineNo: command.lineNo,
        amount: command.amount,
        memo: command.memo,
        needsReview: false,
      });
      await repo.save(updated);
      return;
    }

    // 3. 発生日が変わった場合: 元のレコードを削除し、新発生日で新規採番して保存 (US3)
    await repo.delete(command.caseAssignmentId, oldDate, command.lineNo);
    const newLineNo = await repo.getNextLineNo(command.caseAssignmentId, targetDate);

    const updated = new OtherExpense({
      caseAssignmentId: command.caseAssignmentId,
      occurrenceDate: targetDate,
      lineNo: newLineNo,
      amount: command.amount,
      memo: command.memo,
      needsReview: false,
    });

    await repo.save(updated);
  }

  async deleteOtherExpense(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    await repo.delete(caseAssignmentId, occurrenceDateOrLineNo, lineNo);
  }
}
