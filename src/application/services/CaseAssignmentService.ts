import { CaseAssignment } from '../../domain/models';
import { CaseAssignmentRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CaseAssignmentUseCase,
  CreateCaseAssignmentCommand,
  UpdateCaseAssignmentCommand,
} from '../usecases/CaseAssignmentUseCase';

/**
 * 案件作業明細（アサイン契約）管理に関するユースケースの具象サービス実装。
 */
export class CaseAssignmentService implements CaseAssignmentUseCase {
  private getRepository(): CaseAssignmentRepository {
    return RepositoryRegistry.getCaseAssignmentRepository();
  }

  async getAssignments(): Promise<readonly CaseAssignment[]> {
    const raw = await this.getRepository().findAll();
    const resolved: CaseAssignment[] = [];
    for (const a of raw) {
      resolved.push(await this.resolveDynamicCost(a));
    }
    return resolved;
  }

  async getAssignmentsByCase(projectId: string, caseId: string): Promise<readonly CaseAssignment[]> {
    const raw = await this.getRepository().findByCaseId(projectId, caseId);
    const resolved: CaseAssignment[] = [];
    for (const a of raw) {
      resolved.push(await this.resolveDynamicCost(a));
    }
    return resolved;
  }

  /**
   * 期間の自動再計算と一貫性バリデーションを行うヘルパー
   */
  private async recalculateAndValidate(
    projectId: string,
    caseId: string,
    targetList: { id: string; startDate: string; contractEffort: number; contractPrice: number; cost: number }[]
  ): Promise<CaseAssignment[]> {
    const caseRepo = RepositoryRegistry.getCaseRepository();
    const caseObj = await caseRepo.findById(projectId, caseId);
    if (!caseObj) {
      throw new Error('案件が存在しません。');
    }

    // 1. 開始日順にソート
    const sorted = [...targetList].sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (sorted.length === 0) {
      throw new Error('案件作業明細が登録されていません。');
    }

    // 2. 最初の開始日チェック (FR-008)
    if (sorted[0].startDate !== caseObj.startDate) {
      throw new Error('案件の全期間をカバーするように明細を登録してください（隙間が存在します）。');
    }

    const result: CaseAssignment[] = [];

    // 3. 終了日の自動計算と重複・隙間の検証 (FR-007, FR-008)
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      let endDate = '';

      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        // 直後の明細の開始日の前日を終了日とする
        const nextStartDate = new Date(next.startDate);
        nextStartDate.setDate(nextStartDate.getDate() - 1);
        
        const year = nextStartDate.getFullYear();
        const month = String(nextStartDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextStartDate.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}`;
      } else {
        // 最終行は案件の終了日
        endDate = caseObj.endDate;
      }

      // 重複・期間順序チェック
      if (new Date(current.startDate) > new Date(endDate)) {
        throw new Error('案件作業明細の期間に重複または順序の不正があります。');
      }

      result.push(
        new CaseAssignment(
          projectId,
          current.id,
          caseId,
          current.startDate,
          endDate,
          current.contractEffort,
          current.contractPrice,
          current.cost
        )
      );
    }

    return result;
  }

  async createAssignment(command: CreateCaseAssignmentCommand): Promise<CaseAssignment> {
    const repo = this.getRepository();

    // 1. 新規登録用に自動採番IDを解決
    const nextId = await repo.nextIdentity();

    // 2. 既存の同案件に紐づく明細をロード
    const existing = await repo.findByCaseId(command.projectId, command.caseId);

    // 3. 新規明細を「仮ID」で含めたリストを構築して期間再計算と検証
    const draftList = [
      ...existing.map((a) => ({
        id: a.id,
        startDate: a.startDate,
        contractEffort: a.contractEffort,
        contractPrice: a.contractPrice,
        cost: a.cost
      })),
      {
        id: nextId,
        startDate: command.startDate,
        contractEffort: command.contractEffort,
        contractPrice: command.contractPrice,
        cost: 0 // 新規登録時は実績原価なし
      }
    ];

    const validatedList = await this.recalculateAndValidate(command.projectId, command.caseId, draftList);

    // 4. 整合性を満たした全明細を保存（期間終了日が更新された既存分も含めてすべて保存）
    for (const assignment of validatedList) {
      await repo.save(assignment);
    }

    // 新しく登録されたインスタンスを返却
    const saved = validatedList.find((a) => a.id === nextId);
    if (!saved) {
      throw new Error('登録データの保存に失敗しました。');
    }
    return saved;
  }

  async updateAssignment(command: UpdateCaseAssignmentCommand): Promise<void> {
    const repo = this.getRepository();
    const existingObj = await repo.findById(command.id);
    if (!existingObj) {
      throw new Error('対象の作業契約明細が存在しません。');
    }

    const caseId = existingObj.caseId;
    const existingList = await repo.findByCaseId(command.projectId, caseId);

    // 更新対象のデータを入れ替えたリストを構築
    const draftList = existingList.map((a) => {
      if (a.id === command.id) {
        return {
          id: a.id,
          startDate: command.startDate,
          contractEffort: command.contractEffort,
          contractPrice: command.contractPrice,
          cost: a.cost // 原価は引き継ぐ
        };
      }
      return {
        id: a.id,
        startDate: a.startDate,
        contractEffort: a.contractEffort,
        contractPrice: a.contractPrice,
        cost: a.cost
      };
    });

    const validatedList = await this.recalculateAndValidate(command.projectId, caseId, draftList);

    // 保存
    for (const assignment of validatedList) {
      await repo.save(assignment);
    }
  }

  async deleteAssignment(projectId: string, id: string): Promise<void> {
    // 1. 参照整合性チェック (発注、工数、その他経費からの参照チェック) (FR-012)
    const orderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const expenseRepo = RepositoryRegistry.getOtherExpenseRepository();

    const hasOrder = await orderRepo.existsByCaseAssignmentId(projectId, id);
    const hasWorkTime = await workTimeRepo.existsByCaseAssignmentId(projectId, id);
    const hasExpense = await expenseRepo.existsByCaseAssignmentId(projectId, id);

    if (hasOrder || hasWorkTime || hasExpense) {
      throw new Error(
        'この作業契約は発注実績、工数実績、またはその他経費実績から参照されているため削除できません。'
      );
    }

    // 2. 物理削除
    const repo = this.getRepository();
    await repo.delete(id);
  }

  private async resolveDynamicCost(assignment: CaseAssignment): Promise<CaseAssignment> {
    const orderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const expenseRepo = RepositoryRegistry.getOtherExpenseRepository();

    const orderCost = await orderRepo.sumByCaseAssignmentId(assignment.projectId, assignment.id);
    const workTimeCost = await workTimeRepo.sumCostByCaseAssignmentId(assignment.projectId, assignment.id);
    const expenseCost = await expenseRepo.sumByCaseAssignmentId(assignment.projectId, assignment.id);

    const dynamicCost = orderCost + workTimeCost + expenseCost;

    return new CaseAssignment(
      assignment.projectId,
      assignment.id,
      assignment.caseId,
      assignment.startDate,
      assignment.endDate,
      assignment.contractEffort,
      assignment.contractPrice,
      dynamicCost
    );
  }
}
