import PageShell from "../../components/layout/PageShell";
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, FileText, Receipt, AlertCircle } from 'lucide-react';

const ManagerDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['manager-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/manager/stats');
      return res.data;
    },
  });

  const cards = [
    { label: 'Total Interns', value: stats?.total_interns || 0, icon: Users, color: '#6366f1', bg: '#ede9fe', desc: 'Active interns' },
    { label: 'Pending Verifications', value: stats?.pending_verifications || 0, icon: FileText, color: '#ea580c', bg: '#ffedd5', desc: 'Logs awaiting review' },
    { label: 'Pending Expenses', value: stats?.pending_expenses || 0, icon: Receipt, color: '#7c3aed', bg: '#ede9fe', desc: 'Claims to process' },
    { label: 'Overdue Tasks', value: stats?.overdue_tasks || 0, icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', desc: 'Past due date' },
  ];

  return (
    <PageShell title="Manager Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {cards.map(({ label, value, icon: Icon, color, bg, desc }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '12px', border: '1px solid #e8eaf0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{label}</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} strokeWidth={2} />
              </div>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: '700', color: '#0f1623', lineHeight: 1 }}>{value}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{desc}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default ManagerDashboard;