import { Case } from '../../domain/models';
import { CaseRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CreateCaseCommand,
  CaseUseCase,
  UpdateCaseCommand,
} from '../usecases/CaseUseCase';

/**
 * 案件マスタ管理のユースケースを処理する具象アプリケーションサービス。
 */
export class CaseService implements CaseUseCase {
  private getRepository(): CaseRepository {
    return RepositoryRegistry.getCaseRepository();
  }

  async getCases(): Promise<readonly Case[]> {
    return this.getRepository().findAll();
  }

  async getCasesByProject(projectId: string): Promise<readonly Case[]> {
    return this.getRepository().findByProjectId(projectId);
  }

  async createCase(command: CreateCaseCommand): Promise<Case> {
    // 1. プロジェクト存在確認
    const projectRepo = RepositoryRegistry.getProjectRepository();
    const project = await projectRepo.findById(command.projectId);
    if (!project) {
      throw new Error('指定されたプロジェクトは登録されていません。');
    }

    // 2. 同一プロジェクト内の重複名チェック
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    const existingCases = await this.getRepository().findByProjectId(command.projectId);
    const isDuplicate = existingCases.some(
      (c) => c.name === trimmedName
    );
    if (isDuplicate) {
      throw new Error('この案件名は同一プロジェクト内にすでに登録されています。');
    }

    // 3. 自動採番
    const nextId = await this.getRepository().nextIdentity(command.projectId);

    // 4. ドメインオブジェクトのインスタンス化 (この中で日付整合性等バリデーションが走る)
    const newCase = new Case(
      command.projectId,
      nextId,
      command.name,
      command.startDate,
      command.endDate
    );

    // 5. 保存
    await this.getRepository().save(newCase);
    return newCase;
  }

  async updateCase(command: UpdateCaseCommand): Promise<void> {
    // 1. 存在確認
    const existing = await this.getRepository().findById(command.projectId, command.id);
    if (!existing) {
      throw new Error('指定された案件は存在しません。');
    }

    // 2. 同一プロジェクト内の重複名チェック (自分自身は除外)
    const trimmedName = command.name ? command.name.replace(/^[\s　]+|[\s　]+$/g, '') : '';
    const existingCases = await this.getRepository().findByProjectId(command.projectId);
    const isDuplicate = existingCases.some(
      (c) => c.id !== command.id && c.name === trimmedName
    );
    if (isDuplicate) {
      throw new Error('この案件名は同一プロジェクト内にすでに登録されています。');
    }

    // 3. ドメインオブジェクトのイミュータブル再構築
    const updatedCase = new Case(
      command.projectId,
      command.id,
      command.name,
      command.startDate,
      command.endDate
    );

    // 4. 保存
    await this.getRepository().save(updatedCase);
  }

  async deleteCase(projectId: string, id: string): Promise<void> {
    // 1. 参照整合性チェック (アサイン実績チェック)
    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const hasAssignment = await assignRepo.existsByCaseId(projectId, id);
    if (hasAssignment) {
      throw new Error('この案件はアサイン実績（案件作業明細）から参照されているため削除できません。');
    }

    // 2. 物理削除
    await this.getRepository().delete(projectId, id);
  }
}
