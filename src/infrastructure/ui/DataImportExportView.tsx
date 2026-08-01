import React, { useState, useEffect } from 'react';
import { DataIoService, StorageTableInfo } from '../../application/services/DataIoService';

export const DataImportExportView: React.FC = () => {
  const [summaryList, setSummaryList] = useState<StorageTableInfo[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ioService = new DataIoService();

  const loadSummary = () => {
    const list = ioService.getDataSummary();
    setSummaryList(list);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // エクスポート実行
  const handleExport = () => {
    try {
      ioService.downloadExportFile();
      setMessage({ type: 'success', text: 'バックアップJSONファイルのダウンロードを開始しました。' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'エクスポートに失敗しました。' });
    }
  };

  // ファイル選択イベント
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setFileName('');
      setSelectedFileContent('');
      return;
    }

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content || '');
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'ファイルの読み込みに失敗しました。' });
    };
    reader.readAsText(file);
  };

  // インポート実行
  const handleImport = () => {
    if (!selectedFileContent) {
      setMessage({ type: 'error', text: 'インポートするJSONファイルを選択してください。' });
      return;
    }

    if (!window.confirm('現在のデータを上書きして復元を実行しますか？この操作は取り消せません。')) {
      return;
    }

    const result = ioService.importBackupJson(selectedFileContent);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setSelectedFileContent('');
      setFileName('');
      loadSummary();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  // 初期化（シード状態へリセット）
  const handleReset = () => {
    if (window.confirm('すべての登録データをクリアして初期状態（初期シードデータ）にリセットしますか？')) {
      ioService.resetToDefaultSeed();
      setMessage({ type: 'success', text: 'データを初期状態にリセットしました。各画面を開くと初期シードデータが自動設定されます。' });
      loadSummary();
    }
  };

  const totalRecords = summaryList.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 画面ヘッダー */}
      <div className="page-header">
        <h2 className="page-title">データ入出力 (バックアップ・復元)</h2>
        <p className="page-subtitle">
          全ドメイン集約データのJSONファイル出力（バックアップ）および取り込み（復元）、初期状態へのリセットを行います。
        </p>
      </div>

      {/* アラート通知 */}
      {message && (
        <div
          className={message.type === 'success' ? 'alert-success' : 'alert-error'}
          style={
            message.type === 'success'
              ? {
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '14px',
                  fontWeight: 500,
                }
              : undefined
          }
        >
          {message.text}
        </div>
      )}

      {/* 入出力カード 2カラムグリッド */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* エクスポートカード */}
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ padding: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📥</span> データ出力 (バックアップ)
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              現在登録されているすべてのマスタ・案件・発注・工数・経費データを構造化JSONファイルとしてローカルPCへ保存します。
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>現在記録されている全データ件数</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {totalRecords.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>件</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', fontSize: '14px', justifyContent: 'center' }}
            id="export-json-btn"
          >
            バックアップJSONの出力ダウンロード
          </button>
        </div>

        {/* インポートカード */}
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ padding: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📤</span> データ入力 (復元)
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              事前に出力されたバックアップJSONファイルを選択して読み込み、システムへデータを復元します。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="json-file-input"
              style={{
                display: 'block',
                border: '2px dashed rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>
                {fileName ? `選択ファイル: ${fileName}` : 'クリックしてJSONファイルを選択'}
              </div>
              <input
                id="json-file-input"
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button
            onClick={handleImport}
            disabled={!selectedFileContent}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '14px',
              justifyContent: 'center',
              opacity: !selectedFileContent ? 0.5 : 1,
              cursor: !selectedFileContent ? 'not-allowed' : 'pointer',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
            }}
            id="import-json-btn"
          >
            データインポート（復元）の実行
          </button>
        </div>
      </div>

      {/* データ集約別管理サマリ & リセット */}
      <div className="glass-panel overflow-hidden" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
              データ集約別保存件数一覧
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              ブラウザのLocalStorageに保存されているカテゴリ別のデータ件数サマリです。
            </p>
          </div>
          <button
            onClick={handleReset}
            className="btn btn-danger"
            id="reset-seed-btn"
          >
            ⚠️ 初期状態にリセット
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>カテゴリ・機能名</th>
                <th>LocalStorage キー</th>
                <th style={{ textAlign: 'right' }}>保存件数</th>
              </tr>
            </thead>
            <tbody>
              {summaryList.map((item) => (
                <tr key={item.key}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>{item.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>{item.key}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: item.count > 0 ? '#38bdf8' : '#64748b', fontWeight: 600 }}>
                    {item.count.toLocaleString()} 件
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
