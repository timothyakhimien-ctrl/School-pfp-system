// src/pages/Terms.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { Calendar, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const Terms = () => {
  const { currentSchool } = useContext(AuthContext);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [termName, setTermName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/terms/');
      setTerms(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool]);

  const openCreateModal = () => {
    setEditingTerm(null);
    setTermName('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingTerm(t);
    setTermName(t.name);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (editingTerm) {
        await api.put(`/terms/${editingTerm.id}`, { name: termName.trim() });
      } else {
        await api.post('/terms/', { name: termName.trim() });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to save academic term.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    try {
      await api.delete(`/terms/${id}`);
      await loadData();
    } catch {
      alert('Failed to delete term.');
    }
  };

  if (!currentSchool) {
    return (
      <div className="empty-state">
        <Calendar size={48} />
        <h3>Please select or create a school first</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Terms & Sessions</h1>
          <p className="page-subtitle">
            Define grading cycles, semesters, and examination terms for {currentSchool.name}.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Academic Term</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading terms...
        </div>
      ) : terms.length === 0 ? (
        <div className="spms-card empty-state">
          <Calendar size={48} />
          <h3>No academic terms defined yet</h3>
          <p>Create terms (e.g. First Term 2026, Second Term, Fall Semester) to record evaluations.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            Add First Term
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {terms.map((t) => (
            <div key={t.id} className="spms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Calendar size={22} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: #{t.id}</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {t.name}
                </h3>

                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Created {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Active cycle'}
                </span>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => openEditModal(t)}
                  className="btn btn-secondary btn-sm"
                  title="Edit Term"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444' }}
                  title="Delete Term"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingTerm ? 'Edit Academic Term' : 'Add Academic Term'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Term Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. First Term 2026/2027, Spring Semester"
                    className="form-input"
                    value={termName}
                    onChange={(e) => setTermName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingTerm ? 'Update Term' : 'Add Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Terms;
