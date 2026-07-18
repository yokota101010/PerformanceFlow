import { useState } from 'react';
import { ProjectView } from './infrastructure/ui/ProjectView';
import { EmployeeView } from './infrastructure/ui/EmployeeView';
import { PartnerView } from './infrastructure/ui/PartnerView';
import { StaffView } from './infrastructure/ui/StaffView';

type Tab = 'projects' | 'employees' | 'partners' | 'staffs';

/**
 * アプリケーションのメインコンポーネント。
 * 各マスタ管理画面の切り替えナビゲーションを管理する。
 */
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Performance<span style={{ color: '#3b82f6' }}>Flow</span>
        </h1>

        <nav style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'projects' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'projects' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'projects' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            プロジェクトマスタ
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'employees' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'employees' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'employees' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            社員マスタ
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'partners' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'partners' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'partners' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            発注先マスタ
          </button>
          <button
            onClick={() => setActiveTab('staffs')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'staffs' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'staffs' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'staffs' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            要員マスタ
          </button>
        </nav>

        <div style={{ fontSize: '14px', color: '#64748b' }}>v0.1.0</div>
      </header>
      
      <main style={{ flex: 1, padding: '40px 20px' }}>
        {activeTab === 'projects' && <ProjectView />}
        {activeTab === 'employees' && <EmployeeView />}
        {activeTab === 'partners' && <PartnerView />}
        {activeTab === 'staffs' && <StaffView />}
      </main>
    </div>
  );
}

export default App;
