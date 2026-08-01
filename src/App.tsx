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

  const navButtonStyle = (tab: Tab) => ({
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: activeTab === tab ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    color: activeTab === tab ? '#3b82f6' : '#94a3b8',
    border: activeTab === tab ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

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

        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('projects')} style={navButtonStyle('projects')}>
            プロジェクト
          </button>
          <button onClick={() => setActiveTab('cases')} style={navButtonStyle('cases')}>
            案件管理
          </button>
          <button onClick={() => setActiveTab('assignments')} style={navButtonStyle('assignments')}>
            案件明細
          </button>
          <button onClick={() => setActiveTab('orders')} style={navButtonStyle('orders')}>
            発注管理
          </button>
          <button onClick={() => setActiveTab('workTimes')} style={navButtonStyle('workTimes')}>
            社員工数
          </button>
          <button onClick={() => setActiveTab('otherExpenses')} style={navButtonStyle('otherExpenses')} id="nav-other-expenses-btn">
            経費入力
          </button>
          <button onClick={() => setActiveTab('employees')} style={navButtonStyle('employees')}>
            社員マスタ
          </button>
          <button onClick={() => setActiveTab('employeeUnitPrices')} style={navButtonStyle('employeeUnitPrices')} id="nav-employee-unit-price-btn">
            社員単価設定
          </button>
          <button onClick={() => setActiveTab('employeeWorkTimeSummary')} style={navButtonStyle('employeeWorkTimeSummary')} id="nav-employee-worktime-summary-btn">
            社員工数サマリ
          </button>
          <button onClick={() => setActiveTab('partners')} style={navButtonStyle('partners')}>
            発注先マスタ
          </button>
          <button onClick={() => setActiveTab('staffs')} style={navButtonStyle('staffs')}>
            要員マスタ
          </button>
          <button onClick={() => setActiveTab('staffUnitPrices')} style={navButtonStyle('staffUnitPrices')} id="nav-staff-unit-price-btn">
            要員単価設定
          </button>
          <button onClick={() => setActiveTab('memberWorkTimeSummary')} style={navButtonStyle('memberWorkTimeSummary')} id="nav-member-worktime-summary-btn">
            要員工数サマリ
          </button>
          <button onClick={() => setActiveTab('dataIo')} style={navButtonStyle('dataIo')} id="nav-data-io-btn">
            データ入出力
          </button>
        </nav>

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


