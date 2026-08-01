import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataImportExportView } from '../../../../src/infrastructure/ui/DataImportExportView';

describe('DataImportExportView (データ入出力UI)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('データ入出力画面が正常に初期描画され、タイトルと出力・入力カードが表示されること', () => {
    render(<DataImportExportView />);
    expect(screen.getByText('データ入出力 (バックアップ・復元)')).toBeInTheDocument();
    expect(screen.getByText(/データ出力 \(バックアップ\)/)).toBeInTheDocument();
    expect(screen.getByText(/データ入力 \(復元\)/)).toBeInTheDocument();
    expect(screen.getByText('バックアップJSONの出力ダウンロード')).toBeInTheDocument();
  });

  it('データ集約別保存件数テーブルに各マスタキーと件数が表示されていること', () => {
    render(<DataImportExportView />);
    expect(screen.getByText('プロジェクトマスタ')).toBeInTheDocument();
    expect(screen.getByText('performance_flow_projects')).toBeInTheDocument();
  });
});
