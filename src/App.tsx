import { ProjectView } from './infrastructure/ui/ProjectView';

/**
 * アプリケーションのメインコンポーネント。
 * 全体のレイアウトおよびヘッダー、ProjectViewの配置を行う。
 */
function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '20px 40px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Performance<span style={{ color: '#3b82f6' }}>Flow</span>
        </h1>
        <div style={{ fontSize: '14px', color: '#64748b' }}>v0.1.0</div>
      </header>
      <main style={{ flex: 1, padding: '40px 20px' }}>
        <ProjectView />
      </main>
    </div>
  );
}

export default App;
