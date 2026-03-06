import PageShell from '../../components/layout/PageShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const ManagerTasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [internId, setInternId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/tasks/', { intern_id: internId, title, description, due_date: dueDate, priority });
    },
    onSuccess: () => {
      toast.success('Task assigned!');
      setShowForm(false);
      setTitle(''); setDescription(''); setDueDate(''); setInternId('');
      queryClient.invalidateQueries();
    },
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#f8f9fc',
    border: '1px solid #e8eaf0', borderRadius: '8px', color: '#0f1623',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' };

  const priorityColors: Record<string, { color: string; bg: string }> = {
    high: { color: '#dc2626', bg: '#fee2e2' },
    medium: { color: '#ea580c', bg: '#ffedd5' },
    low: { color: '#16a34a', bg: '#dcfce7' },
  };

  return (
    <PageShell title="Manage Tasks">
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: showForm ? '#fee2e2' : '#6366f1',
            border: 'none', borderRadius: '8px', color: showForm ? '#dc2626' : '#fff',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Assign New Task</>}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e8eaf0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '28px',
        }}>
          <h3 style={{ margin: '0 0 22px', fontSize: '16px', fontWeight: '700', color: '#0f1623' }}>Assign Task to Intern</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Intern ID</label>
              <input type="text" placeholder="Enter intern user ID" value={internId} onChange={(e) => setInternId(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Task Title</label>
              <input type="text" placeholder="e.g. Build login page" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea placeholder="Describe the task in detail..." value={description} onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            {priority && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: priorityColors[priority]?.bg, color: priorityColors[priority]?.color,
                  textTransform: 'uppercase',
                }}>
                  {priority} priority
                </span>
              </div>
            )}

            <button
              onClick={() => createMutation.mutate()}
              disabled={!internId || !title || !dueDate || createMutation.isPending}
              style={{
                padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px',
                color: '#fff', fontWeight: '700', fontSize: '15px',
                cursor: !internId || !title || !dueDate ? 'not-allowed' : 'pointer',
                opacity: !internId || !title || !dueDate ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {createMutation.isPending ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaf0', padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Plus size={24} color="#6366f1" />
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#0f1623' }}>Assign a task</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Click "Assign New Task" to get started</p>
        </div>
      )}
    </PageShell>
  );
};

export default ManagerTasks;