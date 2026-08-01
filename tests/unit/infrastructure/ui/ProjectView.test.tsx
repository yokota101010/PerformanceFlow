import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectView } from '../../../../src/infrastructure/ui/ProjectView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryProjectRepository } from '../../../../src/infrastructure/persistence/InMemoryProjectRepository';

describe('ProjectView (一覧画面)', () => {
  beforeEach(async () => {
    RepositoryRegistry.clear();
    const repo = new InMemoryProjectRepository();
    const { Project } = await import('../../../../src/domain/models');
    await repo.save(new Project('PJ001', '基幹基盤システム刷新プロジェクト'));
    RepositoryRegistry.registerProjectRepository(repo);
  });

  it('初期読み込み時にプロジェクト一覧がテーブル表示され、シードデータが表示されること', async () => {
    render(<ProjectView />);

    const nameCell = await screen.findByText('基幹基盤システム刷新プロジェクト');
    expect(nameCell).toBeInTheDocument();

    const idCell = screen.getByText('PJ001');
    expect(idCell).toBeInTheDocument();
  });
});
