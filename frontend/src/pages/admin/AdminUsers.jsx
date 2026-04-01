import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Edit2, Check, X, Shield, Activity, Calendar, Mail } from 'lucide-react';
import { getAdminUsers, updateAdminUser } from '../../api/api';
import { TableRowSkeleton } from '../../components/admin/AdminUi';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [, setSaving] = useState(false);

  const fetchUsers = (q = '') =>
    getAdminUsers(q)
      .then(r => setUsers(r.data.users || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  const startEdit = (user) => {
    setEditing(user.id || user._id);
    setEditForm({
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      role: user.role
    });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await updateAdminUser(id, editForm);
      toast.success('User updated');
      setEditing(null);
      fetchUsers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">

    {/* HEADER */}
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage users, roles and subscriptions
        </p>
      </div>
  
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
        <Users size={18} className="text-blue-400" />
        <span className="font-semibold text-lg">{users.length}</span>
        <span className="text-xs text-gray-400">users</span>
      </div>
    </motion.div>
  
    {/* SEARCH */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full md:max-w-sm"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
      <input
        value={search}
        onChange={handleSearch}
        placeholder="Search users..."
        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 outline-none transition"
      />
    </motion.div>
  
    {/* MOBILE CARDS */}
    <div className="md:hidden flex flex-col gap-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
        ))
      ) : users.length === 0 ? (
        <div className="text-center py-14 bg-white/5 border border-dashed border-white/10 rounded-xl">
          <Users className="mx-auto opacity-30 mb-2" size={32} />
          <p className="text-gray-400 text-sm">No users found</p>
        </div>
      ) : (
        users.map((u) => (
          <motion.div
            key={u._id}
            layout
            className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 backdrop-blur-md"
          >
            {/* TOP */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {u.name?.[0]?.toUpperCase()}
              </div>
  
              <div className="flex-1">
                {editing === u._id ? (
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <p className="font-semibold">{u.name}</p>
                )}
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
  
            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* ROLE */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                {editing === u._id ? (
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400">
                    {u.role}
                  </span>
                )}
              </div>
  
              {/* STATUS */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {editing === u._id ? (
                  <select
                    value={editForm.subscriptionStatus}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        subscriptionStatus: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-400">
                    {u.subscriptionStatus}
                  </span>
                )}
              </div>
            </div>
  
            {/* ACTIONS */}
            {editing === u._id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(u._id)}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-2"
                >
                  <Check size={16} className="mx-auto text-green-400" />
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg py-2"
                >
                  <X size={16} className="mx-auto text-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit(u)}
                className="w-full py-2 text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg"
              >
                Edit User
              </button>
            )}
          </motion.div>
        ))
      )}
    </div>
  
    {/* DESKTOP TABLE */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
  
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))
              : users.map((u) => {
                  const rowId = u.id || u._id;
                  const isEditing = editing === rowId;
                  return (
                  <tr key={rowId} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            <p className="font-medium">{u.name}</p>
                          )}
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
  
                    <td>
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400">
                          {u.role}
                        </span>
                      )}
                    </td>
  
                    <td>
                      {isEditing ? (
                        <select
                          value={editForm.subscriptionStatus}
                          onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value })}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="expired">Expired</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-400">
                          {u.subscriptionStatus}
                        </span>
                      )}
                    </td>
  
                    <td className="text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </td>
  
                    <td>
                      <div className="flex justify-center">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveEdit(rowId)}
                              className="p-2 hover:bg-white/10 rounded-md transition"
                              title="Save"
                            >
                              <Check size={16} className="text-green-400" />
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="p-2 hover:bg-white/10 rounded-md transition"
                              title="Cancel"
                            >
                              <X size={16} className="text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(u)}
                            className="p-2 hover:bg-white/10 rounded-md transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </motion.div>
  
  </div>
  );
}