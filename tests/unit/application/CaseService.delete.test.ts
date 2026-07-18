import { describe, it, expect, beforeEach } from 'vitest';
import { CaseService } from '../../../src/application/services/CaseService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { Case } from '../../../src/domain/models';

describe('CaseService.deleteCase (削除)', () => {
  let service: CaseService;
  let caseRepo: InMemoryCaseRepository;
  let assignRepo: InMemoryCaseAssignmentRepository;

  beforeEach(() => {
    RepositoryRegistry.clear();
    caseRepo = new InMemoryCaseRepository();
    assignRepo = new InMemoryCaseAssignmentRepository();
    
    RepositoryRegistry.registerCaseRepository(caseRepo);
    RepositoryRegistry.registerCaseAssignmentRepository(assignRepo);
    
    service = new CaseService();
  });

  it('アサイン実績 (案件作業明細) が存在しない案件は正常に物理削除できること', async () => {
    // 既存 AJ001 はアサイン実績がある (ダミーの初期状態)
    // 参照のない新規案件 AJ003 を追加
    await caseRepo.save(new Case('PJ001', 'AJ003', '新規案件3', '2026-10-01', '2026-11-01'));
    assignRepo.setHasAssignment('PJ001', 'AJ003', false); // 参照なしを明示

    // 削除実行
    await service.deleteCase('PJ001', 'AJ003');

    // リポジトリから消滅していることを確認
    const target = await caseRepo.findById('PJ001', 'AJ003');
    expect(target).toBeNull();
  });

  it('アサイン実績が存在する案件の削除は、エラーでブロックされること', async () => {
    // AJ001 はアサイン実績あり
    await expect(service.deleteCase('PJ001', 'AJ001'))
      .rejects
      .toThrow('この案件はアサイン実績（案件作業明細）から参照されているため削除できません。');

    // 削除されていないことを確認
    const target = await caseRepo.findById('PJ001', 'AJ001');
    expect(target).not.toBeNull();
  });
});
