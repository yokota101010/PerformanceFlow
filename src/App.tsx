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
import { FinancialSummaryView } from './infrastructure/ui/FinancialSummaryView';
import { FinancialSummaryService } from './application/services/FinancialSummaryService';
import { MonthlyMemberWorkHoursSummaryView } from './infrastructure/ui/MonthlyMemberWorkHoursSummaryView';
import { MonthlyMemberWorkHoursSummaryService } from './application/services/MonthlyMemberWorkHoursSummaryService';
import { RepositoryRegistry } from './infrastructure/persistence/RepositoryRegistry';

type Tab = 'projects' | 'employees' | 'partners' | 'staffs' | 'cases' | 'assignments' | 'orders' | 'workTimes' | 'otherExpenses' | 'financialSummary' | 'memberWorkTimeSummary';

/**
 * アプリケーションのメインコンポーネント。
 * 各マスタ管理画面の切り替えナビゲーションを管理する。
 */
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  const navigateToOtherExpenses = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab('otherExpenses');
  };

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
          <button
            onClick={() => setActiveTab('cases')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'cases' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'cases' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'cases' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            案件管理
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'assignments' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'assignments' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'assignments' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            アサイン契約
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'orders' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'orders' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            発注管理
          </button>
          <button
            onClick={() => setActiveTab('workTimes')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'workTimes' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'workTimes' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'workTimes' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            社員工数入力
          </button>
          <button
            onClick={() => setActiveTab('otherExpenses')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'otherExpenses' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'otherExpenses' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'otherExpenses' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            id="nav-other-expenses-btn"
          >
            その他経費入力
          </button>
          <button
            onClick={() => setActiveTab('financialSummary')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'financialSummary' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'financialSummary' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'financialSummary' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            id="nav-financial-summary-btn"
          >
            収支サマリ
          </button>
          <button
            onClick={() => setActiveTab('memberWorkTimeSummary')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: activeTab === 'memberWorkTimeSummary' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'memberWorkTimeSummary' ? '#3b82f6' : '#94a3b8',
              border: activeTab === 'memberWorkTimeSummary' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            id="nav-member-worktime-summary-btn"
          >
            要員工数サマリ
          </button>
        </nav>

        <div style={{ fontSize: '14px', color: '#64748b' }}>v0.1.0</div>
      </header>
      
      <main style={{ flex: 1, padding: '40px 20px' }}>
        {activeTab === 'projects' && <ProjectView />}
        {activeTab === 'employees' && <EmployeeView />}
        {activeTab === 'partners' && <PartnerView />}
        {activeTab === 'staffs' && <StaffView />}
        {activeTab === 'cases' && <CaseView />}
        {activeTab === 'assignments' && (
          <CaseAssignmentView onSelectAssignment={navigateToOtherExpenses} />
        )}
        {activeTab === 'orders' && <PartnerOrderView />}
        {activeTab === 'workTimes' && <EmployeeWorkTimeView />}
        {activeTab === 'otherExpenses' && (
          <OtherExpenseView
            initialCaseAssignmentId={selectedAssignmentId}
            onBack={() => setActiveTab('assignments')}
          />
        )}
        {activeTab === 'financialSummary' && (
          <FinancialSummaryView
            useCase={
              new FinancialSummaryService(
                RepositoryRegistry.getCaseAssignmentRepository(),
                RepositoryRegistry.getEmployeeWorkTimeRepository(),
                RepositoryRegistry.getPartnerOrderRepository(),
                RepositoryRegistry.getOtherExpenseRepository(),
                RepositoryRegistry.getProjectRepository(),
                RepositoryRegistry.getCaseRepository()
              )
            }
          />
        )}
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
      </main>
    </div>
  );
}

export default App;
