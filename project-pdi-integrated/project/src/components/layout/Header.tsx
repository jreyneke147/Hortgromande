import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface NotifPreview {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  reminder: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  info: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function Header() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifPreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadNotifs() {
      const { data, count } = await supabase
        .from('notifications')
        .select('id, type, title, message, link, is_read, created_at', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      setNotifs((data ?? []) as NotifPreview[]);
      setUnreadCount(count ?? 0);
    }
    loadNotifs();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search programmes, projects, indicators..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {notifs.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell size={20} className="mx-auto text-gray-300 mb-1.5" />
                  <p className="text-xs text-gray-400">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {notifs.map(n => {
                    const cfg = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.info;
                    const NIcon = cfg.icon;
                    return (
                      <div key={n.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50/80 transition-colors">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <NIcon size={12} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-gray-500 truncate">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link
                to="/notifications"
                onClick={() => setBellOpen(false)}
                className="block text-center text-xs font-medium text-brand-700 hover:bg-brand-50 py-2.5 border-t border-gray-100 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 leading-tight">{role?.display_name || 'Viewer'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={15} />
                Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
