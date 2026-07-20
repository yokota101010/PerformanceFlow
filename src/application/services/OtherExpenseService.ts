import { OtherExpenseUseCase, CreateOtherExpenseCommand, UpdateOtherExpenseCommand } from '../usecases/OtherExpenseUseCase';
import { OtherExpense } from '../../domain/models/OtherExpense';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

/**
 * その他経費ユースケースの具象アプリケーションサービス。
 */
export class OtherExpenseService implements OtherExpenseUseCase {
  async getOtherExpenses(caseAssignmentId: string): Promise<readonly OtherExpense[]> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const list = await repo.findByCaseAssignmentId(caseAssignmentId);
    // lineNo 昇順にソートして返却
    return [...list].sort((a, b) => a.lineNo - b.lineNo);
  }

  async createOtherExpense(command: CreateOtherExpenseCommand): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();

    // 1. アサイン契約存在チェック
    // アサインの一覧から該当契約を探す
    const assigns = await assignRepo.findAll();
    const assign = assigns.find(a => a.id === command.caseAssignmentId);
    if (!assign) {
      throw new Error('指定された作業契約が存在しません。');
    }

    // 2. 自動採番
    const lineNo = await repo.getNextLineNo(command.caseAssignmentId);

    // 3. ドメインオブジェクト生成（バリデーション実行）
    const otherExpense = new OtherExpense({
      caseAssignmentId: command.caseAssignmentId,
      lineNo,
      amount: command.amount,
      memo: command.memo,
    });

    await repo.save(otherExpense);
  }

  async updateOtherExpense(command: UpdateOtherExpenseCommand): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();

    // 1. 存在チェック
    const existing = await repo.findByKeys(command.caseAssignmentId, command.lineNo);
    if (!existing) {
      throw new Error('対象の経費データが存在しません。');
    }

    // 2. 更新ドメインオブジェクト生成（バリデーション実行）
    const updated = new OtherExpense({
      caseAssignmentId: command.caseAssignmentId,
      lineNo: command.lineNo,
      amount: command.amount,
      memo: command.memo,
    });

    await repo.save(updated);
  }

  async deleteOtherExpense(caseAssignmentId: string, lineNo: number): Promise<void> {
    const repo = RepositoryRegistry.getOtherExpenseRepository();
    await repo.delete(caseAssignmentId, lineNo);
  }
}
