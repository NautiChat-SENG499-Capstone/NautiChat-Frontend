'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin1', isAdmin: true },
    { id: 2, username: 'user123', isAdmin: false },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const openAddUser = () => {
    setEditUser(null);
    setUsername('');
    setPassword('');
    setRePassword('');
    setFormOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditUser(user);
    setUsername(user.username);
    setPassword('');
    setRePassword('');
    setFormOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleSubmit = () => {
    if (!username || !password || password !== rePassword) return;

    if (editUser) {
      setUsers(prev =>
        prev.map(u =>
          u.id === editUser.id ? { ...u, username } : u
        )
      );
    } else {
      const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers(prev => [...prev, { id: newId, username, isAdmin: false }]);
    }

    setFormOpen(false);
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <section className="w-full max-w-screen-xl mx-auto py-4 px-6">
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-sm text-gray-600">
              Add, edit, or remove users from the system.
            </p>
          </header>

          <div className="mb-4">
            <button
              onClick={openAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Add User
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
                {users.map(user => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.isAdmin ? 'Admin' : 'User'}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => openEditUser(user)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
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
                <h2 className="text-xl font-bold mb-4">
                  {editUser ? 'Edit User' : 'Add User'}
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full border rounded p-2"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    className="w-full border rounded p-2"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Re-enter Password"
                    className="w-full border rounded p-2"
                    value={rePassword}
                    onChange={e => setRePassword(e.target.value)}
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
                    >
                      {editUser ? 'Update' : 'Add'}
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
