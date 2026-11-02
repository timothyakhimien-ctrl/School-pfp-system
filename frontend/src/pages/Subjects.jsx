// src/pages/Subjects.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { BookOpen, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const Subjects = () => {
  const { currentSchool } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/subjects/');
      setSubjects(res.data || []);
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
    setEditingSubject(null);
    setSubjectName('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSubject(s);
    setSubjectName(s.name);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, { name: subjectName.trim() });
      } else {
        await api.post('/subjects/', { name: subjectName.trim() });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      await loadData();
    } catch {
      alert('Failed to delete subject.');
    }
  };

  if (!currentSchool) {
    return (
      <div className="empty-state">
        <BookOpen size={48} />
        <h3>Please select or create a school first</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum Subjects</h1>
          <p className="page-subtitle">
            Manage academic courses and examinable subjects for {currentSchool.name}.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading subjects...
        </div>
      ) : subjects.length === 0 ? (
        <div className="spms-card empty-state">
          <BookOpen size={48} />
          <h3>No subjects added yet</h3>
          <p>Add curriculum subjects (e.g. Mathematics, English Language, Physics, Biology) to record grades.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            Add First Subject
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {subjects.map((s) => (
            <div key={s.id} className="spms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <BookOpen size={22} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: #{s.id}</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  {s.name}
                </h3>

                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Added {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => openEditModal(s)}
                  className="btn btn-secondary btn-sm"
                  title="Edit Subject"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444' }}
                  title="Delete Subject"
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
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, English Language, Physics"
                    className="form-input"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
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
                  {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
