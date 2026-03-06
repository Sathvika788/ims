import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, FileText, CheckSquare, Receipt, DollarSign,
  Calendar, Users, Mail, LogOut, BarChart3, Plane, Home, CalendarCheck,FolderGit2,
  FileX,  // ADD THIS
  MessageSquare,
} from 'lucide-react';

const Sidebar = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const roleAccent =
    user?.role === 'intern' ? '#0ea5e9'
    : user?.role === 'manager' ? '#6366f1'
    : '#f59e0b';

  const roleLight =
    user?.role === 'intern' ? '#e0f2fe'
    : user?.role === 'manager' ? '#ede9fe'
    : '#fef3c7';

  const navBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    color: '#64748b',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.15s',
    marginBottom: '2px',
    fontFamily: "'DM Sans', sans-serif",
  };

  const activeNav: React.CSSProperties = {
    ...navBase,
    background: roleLight,
    color: roleAccent,
    fontWeight: '600',
  };

  const internLinks = [
    { to: '/intern', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/intern/logs', icon: FileText, label: 'Work Logs' },
    { to: '/intern/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/intern/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/intern/stipend', icon: DollarSign, label: 'Stipend' },
    { to: '/intern/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/intern/leave', icon: Plane, label: 'Leave Requests' },
    { to: '/intern/wfh', icon: Home, label: 'Work From Home' },
    { to: '/intern/projects', icon: FolderGit2, label: 'Projects' },
    { to: '/intern/resignation', icon: FileX, label: 'Resignation' },  // ADD
  { to: '/intern/complaints', icon: MessageSquare, label: 'Complaints' },
  ];

  const managerLinks = [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/logs', icon: FileText, label: 'Verify Logs' },
    { to: '/manager/tasks', icon: CheckSquare, label: 'Manage Tasks' },
    { to: '/manager/expenses', icon: Receipt, label: 'Review Expenses' },
    { to: '/manager/leaves', icon: CalendarCheck, label: 'Leave Requests' },
    { to: '/manager/wfh', icon: Home, label: 'WFH Requests' },
    { to: '/manager/stipends', icon: DollarSign, label: 'Stipends' },
    { to: '/manager/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/manager/interns', icon: Users, label: 'Interns' },
    { to: '/manager/invites', icon: Mail, label: 'Invites' },
    { to: '/manager/projects', icon: FolderGit2, label: 'Review Projects' },
    { to: '/manager/resignations', icon: FileX, label: 'Resignations' },  // ADD
  { to: '/manager/complaints', icon: MessageSquare, label: 'Complaints' },
  ];

  const ceoLinks = [
    { to: '/ceo', icon: BarChart3, label: 'Analytics' },
    ...managerLinks,
  ];

  const links =
    user?.role === 'ceo' ? ceoLinks
    : user?.role === 'manager' ? managerLinks
    : internLinks;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div style={{
      width: '260px',
      background: '#ffffff',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid #e8eaf0',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: roleAccent, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px', letterSpacing: '-0.5px' }}>IMS</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f1623' }}>
              {user?.name}
            </p>
            <span style={{
              fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.5px', color: roleAccent,
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 6px' }}>
          Navigation
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/intern' || link.to === '/manager' || link.to === '/ceo'}
            style={({ isActive }) => isActive ? activeNav : navBase}
          >
            <link.icon size={16} strokeWidth={2} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #e8eaf0' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', background: 'transparent', border: '1px solid #fee2e2',
            borderRadius: '8px', color: '#ef4444', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.15s',
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;