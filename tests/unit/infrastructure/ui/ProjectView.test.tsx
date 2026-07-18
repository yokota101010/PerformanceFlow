import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectView } from '../../../../src/infrastructure/ui/ProjectView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryProjectRepository } from '../../../../src/infrastructure/persistence/InMemoryProjectRepository';

describe('ProjectView (一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerProjectRepository(new InMemoryProjectRepository());
  });

  it('初期読み込み時にプロジェクト一覧がテーブル表示され、シードデータが表示されること', async () => {
    render(<ProjectView />);

    const nameCell = await screen.findByText('次世代基幹システム開発プロジェクト');
    expect(nameCell).toBeInTheDocument();

    const idCell = screen.getByText('PJ001');
    expect(idCell).toBeInTheDocument();
  });
});
