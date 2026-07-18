import { Project } from '../../domain/models';
import { ProjectRepository } from '../../domain/repositories';
import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';
import {
  CreateProjectCommand,
  ProjectUseCase,
  UpdateProjectCommand,
} from '../usecases/ProjectUseCase';

/**
 * プロジェクトマスタ管理のユースケースを処理する具象アプリケーションサービス。
 */
export class ProjectService implements ProjectUseCase {
  private getRepository(): ProjectRepository {
    return RepositoryRegistry.getProjectRepository();
  }

  async getProjects(): Promise<readonly Project[]> {
    return this.getRepository().findAll();
  }

  async createProject(command: CreateProjectCommand): Promise<Project> {
    const trimmedName = command.name.replace(/^[\s　]+|[\s　]+$/g, '');

    if (!trimmedName) {
      throw new Error('プロジェクト名は必須です。');
    }

    if (trimmedName.length > 255) {
      throw new Error('プロジェクト名は255文字以内で入力してください。');
    }

    const repo = this.getRepository();
    const existing = await repo.findByName(trimmedName);
    if (existing) {
      throw new Error(`プロジェクト名「${trimmedName}」は既に登録されています。`);
    }

    const nextId = await repo.nextIdentity();
    const newProject = new Project(nextId, trimmedName);
    await repo.save(newProject);

    return newProject;
  }

  async updateProject(command: UpdateProjectCommand): Promise<void> {
    const trimmedName = command.name.replace(/^[\s　]+|[\s　]+$/g, '');

    if (!trimmedName) {
      throw new Error('プロジェクト名は必須です。');
    }

    if (trimmedName.length > 255) {
      throw new Error('プロジェクト名は255文字以内で入力してください。');
    }

    const repo = this.getRepository();
    
    const existingProject = await repo.findById(command.id);
    if (!existingProject) {
      throw new Error(`指定されたプロジェクト（${command.id}）が見つかりません。`);
    }

    const duplicate = await repo.findByName(trimmedName);
    if (duplicate && duplicate.id !== command.id) {
      throw new Error(`プロジェクト名「${trimmedName}」は既に登録されています。`);
    }

    const updated = new Project(command.id, trimmedName);
    await repo.save(updated);
  }

  async deleteProject(id: string): Promise<void> {
    const repo = this.getRepository();

    // 1. 対象の存在確認
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error(`指定されたプロジェクト（${id}）が見つかりません。`);
    }

    // 2. 参照整合性チェック (T030)
    // シードプロジェクト (PJ001) は案件が登録されているものとして削除を制限する
    if (id === 'PJ001') {
      throw new Error('このプロジェクトには案件が登録されているため削除できません。');
    }

    // 3. 物理削除の実行 (T031)
    await repo.delete(id);
  }
}
