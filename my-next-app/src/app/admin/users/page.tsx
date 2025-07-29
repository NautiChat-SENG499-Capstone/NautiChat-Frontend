'use client';

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import api from '@/lib/api';

type User = {
  id: number;
  username: string;
  is_admin: boolean;
};

// ✅ Persistent cache outside the component
let cachedUsers: User[] | null = null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [oncToken, setOncToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFetching = useRef(false);

  // ✅ Smart fetch with cache
  const fetchUsers = (forceRefresh = false) => {
    if (cachedUsers && !forceRefresh) {
      setUsers(cachedUsers);
      return;
    }

    runFullFetch(forceRefresh);
  };

  // ✅ Actually hits the API and compares new vs. cached
  const runFullFetch = async (isRefresh = false) => {
    if (isFetching.current) return;

    if (isRefresh) setRefreshing(true);

    isFetching.current = true;
    const token = localStorage.getItem('access_token');

    try {
      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newUsers = res.data;
      const isChanged = JSON.stringify(newUsers) !== JSON.stringify(cachedUsers);

      if (isChanged) {
        cachedUsers = newUsers;
        setUsers(newUsers);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      isFetching.current = false;
      setRefreshing(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Refresh on tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        cachedUsers = null;
        fetchUsers(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSubmit = async () => {
    if (!username || !password || !rePassword || !oncToken) {
      alert('All fields are required.');
      return;
    }
    if (password !== rePassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      await api.post(
        '/admin/create',
        {
          username,
          password,
          onc_token: oncToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Admin user created!');
      setUsername('');
      setPassword('');
      setRePassword('');
      setOncToken('');
      setFormOpen(false);
      cachedUsers = null;
      fetchUsers(true);
    } catch (err) {
      console.error('Create user error:', err);
      alert('Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('User deleted.');
      cachedUsers = null;
      fetchUsers(true);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user.');
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <section className="w-full max-w-screen-xl mx-auto py-4 px-6">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
              <p className="text-sm text-gray-600">Add or remove admin users.</p>
            </div>
            <button
              onClick={() => {
                cachedUsers = null;
                fetchUsers(true);
              }}
              disabled={refreshing}
              className={`text-sm px-3 py-1 rounded transition ${
                refreshing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {refreshing ? 'Refreshing…' : '🔄 Refresh'}
            </button>
          </header>

          <div className="mb-4">
            <button
              onClick={() => setFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Add Admin
            </button>
          </div>

          <div className="bg-white shadow rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.is_admin ? 'Admin' : 'User'}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 p-4">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {formOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Admin</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full border rounded p-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border rounded p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Re-enter Password"
                    className="w-full border rounded p-2"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="ONC Token"
                    className="w-full border rounded p-2"
                    value={oncToken}
                    onChange={(e) => setOncToken(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setFormOpen(false)}
                      className="px-4 py-2 text-sm border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </AdminLayout>
    </AdminGuard>
  );
}
