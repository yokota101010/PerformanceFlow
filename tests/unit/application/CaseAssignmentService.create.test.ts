import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentService } from '../../../src/application/services/CaseAssignmentService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';

describe('CaseAssignmentService.create (新規登録とバリデーション)', () => {
  let service: CaseAssignmentService;
  let caseAssignmentRepo: InMemoryCaseAssignmentRepository;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    caseAssignmentRepo = new InMemoryCaseAssignmentRepository();
    RepositoryRegistry.registerCaseAssignmentRepository(caseAssignmentRepo);
    
    // プロジェクトマスタ登録
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    await projectRepo.save(new Project('PJ002', '新規社内ポータル開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    // 案件マスタ登録 (AJ001: 2026-08-15 〜 2026-11-15)
    const caseRepo = new InMemoryCaseRepository();
    const { Case } = await import('../../../src/domain/models');
    await caseRepo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    await caseRepo.save(new Case('PJ002', 'AJ001', '案件2: ポータル作成支援', '2026-09-01', '2026-09-30'));
    RepositoryRegistry.registerCaseRepository(caseRepo);

    service = new CaseAssignmentService();
  });

  it('新規プロジェクトPJ002に対して最初の明細を登録した際、WK005として正常に登録され自動採番されること', async () => {
    // PJ002-AJ001 (2026-09-01 〜 2026-09-30) に対し、開始日 2026-09-01 の明細を登録
    const cmd = {
      projectId: 'PJ002',
      caseId: 'AJ001',
      startDate: '2026-09-01',
      contractEffort: 1.0,
      contractPrice: 500000
    };

    const assignment = await service.createAssignment(cmd);
    expect(assignment.id).toBe('WK005');
    expect(assignment.endDate).toBe('2026-09-30'); // 案件の終了日に自動設定
    expect(assignment.sales).toBe(500000);
  });

  it('新規登録時に開始日が案件開始日と一致しない場合（隙間あり）、登録エラーとなること', async () => {
    // PJ002-AJ001 (2026-09-01 〜 2026-09-30) に対し、開始日 2026-09-05 を指定
    const cmd = {
      projectId: 'PJ002',
      caseId: 'AJ001',
      startDate: '2026-09-05',
      contractEffort: 1.0,
      contractPrice: 500000
    };

    await expect(service.createAssignment(cmd)).rejects.toThrow(
      '案件の全期間をカバーするように明細を登録してください（隙間が存在します）。'
    );
  });

  it('工数が0以下、または単価が負数の場合、登録エラーとなること', async () => {
    const cmdEffortError = {
      projectId: 'PJ002',
      caseId: 'AJ001',
      startDate: '2026-09-01',
      contractEffort: 0,
      contractPrice: 500000
    };
    await expect(service.createAssignment(cmdEffortError)).rejects.toThrow(
      '契約工数は0より大きい値を入力してください。'
    );

    const cmdPriceError = {
      projectId: 'PJ002',
      caseId: 'AJ001',
      startDate: '2026-09-01',
      contractEffort: 1.0,
      contractPrice: -100
    };
    await expect(service.createAssignment(cmdPriceError)).rejects.toThrow(
      '契約単価は0以上の値を入力してください。'
    );
  });
});
