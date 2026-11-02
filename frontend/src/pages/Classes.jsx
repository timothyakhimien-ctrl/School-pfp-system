// src/pages/Classes.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { School, Plus, Trash2, Edit2, Users, AlertCircle } from 'lucide-react';

const Classes = () => {
  const { currentSchool } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [clRes, stRes] = await Promise.allSettled([
        api.get('/classes/'),
        api.get('/students/'),
      ]);
      if (clRes.status === 'fulfilled') setClasses(clRes.value.data || []);
      if (stRes.status === 'fulfilled') setStudents(stRes.value.data || []);
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
    setEditingClass(null);
    setClassName('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingClass(c);
    setClassName(c.name);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, { name: className.trim() });
      } else {
        await api.post('/classes/', { name: className.trim() });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to save class.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      await loadData();
    } catch {
      alert('Failed to delete class.');
    }
  };

  const getStudentCount = (classId) => {
    return students.filter((s) => s.class_id === classId).length;
  };

  if (!currentSchool) {
    return (
      <div className="empty-state">
        <School size={48} />
        <h3>Please select or create a school first</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes & Levels</h1>
          <p className="page-subtitle">
            Configure academic classes, streams, and cohorts for {currentSchool.name}.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Class</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="spms-card empty-state">
          <School size={48} />
          <h3>No classes registered yet</h3>
          <p>Create your school's classes (e.g. Grade 9A, Senior Secondary 1, Year 10) to organize students.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            Add First Class
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {classes.map((c) => {
            const count = getStudentCount(c.id);
            return (
              <div key={c.id} className="spms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <School size={22} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: #{c.id}</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                    {c.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                    <Users size={15} color="#94a3b8" />
                    <span>{count} enrolled {count === 1 ? 'student' : 'students'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(c)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Class"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444' }}
                    title="Delete Class"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingClass ? 'Edit Class Name' : 'Create New Class'}
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
                  <label className="form-label">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 10-A, JSS 1, Senior Class"
                    className="form-input"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
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
                  {submitting ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
