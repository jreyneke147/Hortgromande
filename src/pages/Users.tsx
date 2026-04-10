import { useEffect, useState, useCallback } from 'react';
import { Search, Users as UsersIcon, Shield, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Role } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Users() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleDropdownId, setRoleDropdownId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [profRes, roleRes] = await Promise.all([
      supabase.from('profiles').select('*, roles(*)').order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('display_name'),
    ]);
    setProfiles(profRes.data ?? []);
    setRoles(roleRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeRole(profileId: string, roleId: string) {
    setUpdatingUserId(profileId);
    try {
      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: profileId,
        new_role_id: roleId,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setRoleDropdownId(null);
      await load();
    } finally {
      setUpdatingUserId(null);
    }
  }

  const adminRole = roles.find((role) => {
    const roleName = `${role.name} ${role.display_name}`.toLowerCase();
    return roleName.includes('admin');
  });

  async function changeUserToAdmin(profileId: string) {
    if (!adminRole) {
      alert('Admin role was not found.');
      return;
    }

    await changeRole(profileId, adminRole.id);
  }

  const filtered = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles.length} user{profiles.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {roles.map((r) => {
          const count = profiles.filter(p => p.role_id === r.id).length;
          return (
            <div key={r.id} className="card p-4 text-center">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-2">
                <Shield size={16} />
              </div>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.display_name}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<UsersIcon size={48} />} title="No users found" description="Users appear here when they register for the platform" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Organisation</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => {
                  const initials = user.full_name
                    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'U';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{user.organisation || '-'}</td>
                      <td className="px-4 py-3.5">
                        <div className="relative">
                          <button
                            onClick={() => setRoleDropdownId(roleDropdownId === user.id ? null : user.id)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            {user.roles?.display_name ?? 'No role'}
                            <ChevronDown size={13} />
                          </button>
                          {roleDropdownId === user.id && (
                            <div className="absolute left-0 mt-1 w-52 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-20">
                              {roles.map((r) => (
                                <button
                                  key={r.id}
                                  onClick={() => changeRole(user.id, r.id)}
                                  disabled={updatingUserId === user.id}
                                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    user.role_id === r.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {r.display_name}
                                  <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {adminRole && user.role_id !== adminRole.id && (
                          <button
                            type="button"
                            onClick={() => changeUserToAdmin(user.id)}
                            disabled={updatingUserId === user.id}
                            className="mt-2 inline-flex items-center rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingUserId === user.id ? 'Updating...' : 'Make Admin'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
