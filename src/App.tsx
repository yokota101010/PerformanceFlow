import { useState } from 'react';
import { ProjectView } from './infrastructure/ui/ProjectView';
import { EmployeeView } from './infrastructure/ui/EmployeeView';
import { PartnerView } from './infrastructure/ui/PartnerView';
import { StaffView } from './infrastructure/ui/StaffView';
import { CaseView } from './infrastructure/ui/CaseView';
import { CaseAssignmentView } from './infrastructure/ui/CaseAssignmentView';
import { PartnerOrderView } from './infrastructure/ui/PartnerOrderView';
import { EmployeeWorkTimeView } from './infrastructure/ui/EmployeeWorkTimeView';
import { OtherExpenseView } from './infrastructure/ui/OtherExpenseView';
import { MonthlyMemberWorkHoursSummaryView } from './infrastructure/ui/MonthlyMemberWorkHoursSummaryView';
import { MonthlyMemberWorkHoursSummaryService } from './application/services/MonthlyMemberWorkHoursSummaryService';
import { EmployeeUnitPriceView } from './infrastructure/ui/EmployeeUnitPriceView';
import { StaffUnitPriceView } from './infrastructure/ui/StaffUnitPriceView';
import { EmployeeWorkTimeSummaryView } from './infrastructure/ui/EmployeeWorkTimeSummaryView';
import { DataImportExportView } from './infrastructure/ui/DataImportExportView';
import { RepositoryRegistry } from './infrastructure/persistence/RepositoryRegistry';

type Tab =
  | 'projects'
  | 'employees'
  | 'employeeUnitPrices'
  | 'partners'
  | 'staffs'
  | 'staffUnitPrices'
  | 'cases'
  | 'assignments'
  | 'orders'
  | 'workTimes'
  | 'otherExpenses'
  | 'employeeWorkTimeSummary'
  | 'memberWorkTimeSummary'
  | 'dataIo';

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
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Performance<span style={{ color: '#3b82f6' }}>Flow</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="nav-function-select" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
            機能選択:
          </label>
          <select
            id="nav-function-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#38bdf8',
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              minWidth: '220px',
              transition: 'all 0.2s ease',
            }}
          >
            <optgroup label="―― 案件・契約業務 ――" style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700 }}>
              <option value="projects" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>📁 プロジェクト</option>
              <option value="cases" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>📋 案件管理</option>
              <option value="assignments" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>📄 案件明細</option>
            </optgroup>
            <optgroup label="―― 実績・経費入力 ――" style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700 }}>
              <option value="workTimes" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>⏱️ 社員工数</option>
              <option value="orders" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>🛒 発注管理</option>
              <option value="otherExpenses" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>💳 経費入力</option>
            </optgroup>
            <optgroup label="―― 社員管理 ――" style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700 }}>
              <option value="employees" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>👤 社員マスタ</option>
              <option value="employeeUnitPrices" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>💰 社員単価設定</option>
              <option value="employeeWorkTimeSummary" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>📊 社員工数サマリ</option>
            </optgroup>
            <optgroup label="―― 要員・パートナー管理 ――" style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700 }}>
              <option value="partners" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>🏢 発注先マスタ</option>
              <option value="staffs" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>👥 要員マスタ</option>
              <option value="staffUnitPrices" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>💵 要員単価設定</option>
              <option value="memberWorkTimeSummary" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>📈 要員工数サマリ</option>
            </optgroup>
            <optgroup label="―― システム管理 ――" style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700 }}>
              <option value="dataIo" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>💾 データ入出力</option>
            </optgroup>
          </select>
        </div>

        <div style={{ fontSize: '14px', color: '#64748b' }}>v0.1.0</div>
      </header>

      <main style={{ flex: 1, padding: '24px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'projects' && <ProjectView />}
        {activeTab === 'employees' && <EmployeeView />}
        {activeTab === 'employeeUnitPrices' && <EmployeeUnitPriceView />}
        {activeTab === 'partners' && <PartnerView />}
        {activeTab === 'staffs' && <StaffView />}
        {activeTab === 'staffUnitPrices' && <StaffUnitPriceView />}
        {activeTab === 'cases' && <CaseView />}
        {activeTab === 'assignments' && <CaseAssignmentView />}
        {activeTab === 'orders' && <PartnerOrderView />}
        {activeTab === 'workTimes' && <EmployeeWorkTimeView />}
        {activeTab === 'otherExpenses' && <OtherExpenseView />}
        {activeTab === 'employeeWorkTimeSummary' && <EmployeeWorkTimeSummaryView />}
        {activeTab === 'memberWorkTimeSummary' && (
          <MonthlyMemberWorkHoursSummaryView
            useCase={
              new MonthlyMemberWorkHoursSummaryService(
                RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository(),
                RepositoryRegistry.getPartnerOrderRepository(),
                RepositoryRegistry.getStaffRepository(),
                RepositoryRegistry.getPartnerRepository()
              )
            }
          />
        )}
        {activeTab === 'dataIo' && <DataImportExportView />}
      </main>
    </div>
  );
}

export default App;


