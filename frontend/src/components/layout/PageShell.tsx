import Sidebar from './Sidebar';

interface PageShellProps {
  children: React.ReactNode;
  title: string;
}

const PageShell = ({ children, title }: PageShellProps) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px 48px', minHeight: '100vh' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #e8eaf0', paddingBottom: '20px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '26px',
            fontWeight: '700',
            color: '#0f1623',
            letterSpacing: '-0.5px',
            fontFamily: "'DM Sans', sans-serif",
          }}>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default PageShell;