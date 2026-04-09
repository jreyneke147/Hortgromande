import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Check,
  Filter,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface NotifRow {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  reminder: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  info: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' },
};

const CATEGORY_LABELS: Record<string, string> = {
  submission: 'Data Submission',
  validation: 'Validation',
  risk: 'Risk Alert',
  training: 'Training',
  system: 'System',
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  async function load() {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications((data ?? []) as NotifRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function deleteNotif(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const filtered = notifications.filter(n => {
    if (filterCategory && n.category !== filterCategory) return false;
    if (showUnreadOnly && n.is_read) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-1.5 text-sm">
            <CheckCircle2 size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field py-2 text-xs w-auto">
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
            showUnreadOnly ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Filter size={12} /> Unread only
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {notifications.length === 0 ? 'No notifications yet' : 'No notifications matching your filters'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {notifications.length === 0
              ? 'Notifications will appear here when there are alerts, reminders, or updates requiring your attention.'
              : 'Try adjusting your filter settings.'}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
            const NIcon = cfg.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  !notif.is_read ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <NIcon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(notif.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 capitalize">
                      {CATEGORY_LABELS[notif.category] ?? notif.category}
                    </span>
                    {notif.link && (
                      <Link to={notif.link} className="text-[11px] text-brand-700 hover:text-brand-800 font-medium">
                        View details
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-1.5 rounded text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
