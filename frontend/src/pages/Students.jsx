// src/pages/Students.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { Users, Plus, Search, Trash2, Edit2, AlertCircle, School, Calendar } from 'lucide-react';

const Students = () => {
  const { currentSchool } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [classId, setClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [stRes, clRes] = await Promise.allSettled([
        api.get('/students/'),
        api.get('/classes/'),
      ]);
      if (stRes.status === 'fulfilled') setStudents(stRes.value.data || []);
      if (clRes.status === 'fulfilled') setClasses(clRes.value.data || []);
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
    setEditingStudent(null);
    setCode(`STU${String(students.length + 1).padStart(3, '0')}`);
    setFirstName('');
    setLastName('');
    setDob('');
    setClassId(classes.length > 0 ? String(classes[0].id) : '');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingStudent(s);
    setCode(s.code);
    setFirstName(s.first_name);
    setLastName(s.last_name);
    setDob(s.date_of_birth || '');
    setClassId(s.class_id ? String(s.class_id) : '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dob ? dob : null,
        class_id: classId ? parseInt(classId, 10) : null,
      };

      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, payload);
      } else {
        await api.post('/students/', payload);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      await loadData();
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const c = (s.code || '').toLowerCase();
    return fullName.includes(term) || c.includes(term);
  });

  const getClassName = (cid) => {
    if (!cid) return 'Unassigned';
    const found = classes.find((c) => c.id === cid);
    return found ? found.name : `Class #${cid}`;
  };

  if (!currentSchool) {
    return (
      <div className="empty-state">
        <School size={48} />
        <h3>Please select or create a school first</h3>
        <p>A school context is required to view and manage students.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Roster</h1>
          <p className="page-subtitle">
            Manage student registrations, personal details, and class assignments for {currentSchool.name}.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ width: '320px' }}>
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> registered students
        </div>
      </div>

      {/* Table */}
      <div className="spms-table-wrapper">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading students...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <h3>No students found</h3>
            <p>
              {search
                ? 'No students match your search criteria.'
                : 'Get started by enrolling your first student into this school.'}
            </p>
            {!search && (
              <button onClick={openCreateModal} className="btn btn-primary btn-sm">
                Enroll Student
              </button>
            )}
          </div>
        ) : (
          <table className="spms-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Full Name</th>
                <th>Class / Stream</th>
                <th>Date of Birth</th>
                <th>Date Enrolled</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '600', color: '#4f46e5' }}>{s.code}</td>
                  <td style={{ fontWeight: '600' }}>
                    {s.first_name} {s.last_name}
                  </td>
                  <td>
                    <span style={{
                      background: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#334155',
                    }}>
                      {getClassName(s.class_id)}
                    </span>
                  </td>
                  <td>{s.date_of_birth || 'Not specified'}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Student"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
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
                  <label className="form-label">Student Identification Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    placeholder="e.g. STU001"
                    className="form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      className="form-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Class / Grade</label>
                  <select
                    className="form-select"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
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
                  {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
