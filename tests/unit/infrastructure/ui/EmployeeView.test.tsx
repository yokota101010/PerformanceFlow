import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeView } from '../../../../src/infrastructure/ui/EmployeeView';
import { RepositoryRegistry } from '../../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryEmployeeRepository } from '../../../../src/infrastructure/persistence/InMemoryEmployeeRepository';

describe('EmployeeView (社員一覧画面)', () => {
  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerEmployeeRepository(new InMemoryEmployeeRepository());
  });

  it('初期読み込み時に社員一覧がテーブル表示され、シードデータが一覧に表示されること', async () => {
    render(<EmployeeView />);

    // シードデータの社員名が表示されていることを非同期で待機
    const cell1 = await screen.findByText('トム・デマルコ');
    expect(cell1).toBeInTheDocument();

    const cell2 = screen.getByText('ロバート・マーチン');
    expect(cell2).toBeInTheDocument();

    const cell3 = screen.getByText('マーチン・ファウラー');
    expect(cell3).toBeInTheDocument();

    const id1 = screen.getByText('EMP001');
    expect(id1).toBeInTheDocument();
  });
});
