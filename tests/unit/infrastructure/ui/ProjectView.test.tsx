import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectView } from '../../../../src/infrastructure/ui/ProjectView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import React from 'react';

describe('ProjectView (一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
  });

  it('初期読み込み時にプロジェクト一覧がテーブル表示され、シードデータが表示されること', async () => {
    render(<ProjectView />);

    // シードデータのプロジェクト名が表示されていることを非同期で待機
    const nameCell = await screen.findByText('次世代基幹システム開発プロジェクト');
    expect(nameCell).toBeInTheDocument();

    const idCell = screen.getByText('PJ001');
    expect(idCell).toBeInTheDocument();
  });
});
