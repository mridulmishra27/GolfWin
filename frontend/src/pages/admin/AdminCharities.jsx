import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getCharities, createCharity, updateCharity, deleteCharity } from '../../api/api';
import Modal from '../../components/Modal';
import { GlowButton } from '../../components/admin/AdminUi';
import { toast } from 'react-toastify';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', spotlight: false });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchCharities();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCharities = () =>
    getCharities()
      .then(r => setCharities(r.data.charities || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', spotlight: false });
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || '',
      spotlight: c.spotlight || false
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await updateCharity(editing._id, form);
        toast.success('Updated');
      } else {
        await createCharity(form);
        toast.success('Created');
      }
      setModal(false);
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    setDeleting(id);
    try {
      await deleteCharity(id);
      toast.success('Deleted');
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 700 }}>
            Charities
          </h1>
          <p style={{ fontSize: 12, color: '#888' }}>
            Manage charity listings
          </p>
        </div>

        <GlowButton onClick={openAdd} style={{ width: isMobile ? '100%' : 'auto' }}>
          <Plus size={16} /> Add Charity
        </GlowButton>
      </motion.div>

      {/* GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14
      }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                height: 140,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)'
              }} />
            ))
          : charities.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                {/* TOP */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  {c.spotlight && (
                    <span style={{
                      fontSize: 10,
                      color: '#f59e0b',
                      fontWeight: 600
                    }}>
                      ⭐
                    </span>
                  )}
                </div>

                {/* DESC */}
                <div style={{
                  fontSize: 12,
                  color: '#888',
                  marginBottom: 12
                }}>
                  {c.description || 'No description'}
                </div>

                {/* ACTIONS */}
                <div style={{
  display: 'flex',
  gap: 6,
  justifyContent: 'flex-end',
  flexDirection: isMobile ? 'row' : 'row'
}}>
  <button
    onClick={() => openEdit(c)}
    style={{
      padding: '6px 10px',
      borderRadius: 6,
      background: 'rgba(59,130,246,0.12)',
      color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 500,
      cursor: 'pointer'
    }}
  >
    <Edit2 size={12} />
  </button>

  <button
    onClick={() => handleDelete(c._id)}
    disabled={deleting === c._id}
    style={{
      padding: '6px 10px',
      borderRadius: 6,
      background: 'rgba(239,68,68,0.12)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 500,
      cursor: 'pointer'
    }}
  >
    <Trash2 size={12} />
  </button>
</div>
              </motion.div>
            ))}
      </div>

      {/* MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Charity' : 'Add Charity'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            style={{
              padding: 10,
              borderRadius: 8,
              background: '#111',
              border: '1px solid #333',
              color: 'white'
            }}
          />

          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
            style={{
              padding: 10,
              borderRadius: 8,
              background: '#111',
              border: '1px solid #333',
              color: 'white'
            }}
          />

          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={form.spotlight}
              onChange={e => setForm({ ...form, spotlight: e.target.checked })}
            /> Spotlight
          </label>

          <GlowButton onClick={handleSave} loading={saving}>
            {editing ? 'Save' : 'Create'}
          </GlowButton>

        </div>
      </Modal>
    </div>
  );
}