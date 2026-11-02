// src/pages/Results.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { Award, Plus, Trash2, Search, Filter, AlertCircle, Sparkles } from 'lucide-react';

const calculatePreviewGrade = (score) => {
  const num = parseFloat(score);
  if (isNaN(num)) return '-';
  if (num >= 90) return 'A';
  if (num >= 80) return 'B';
  if (num >= 70) return 'C';
  if (num >= 60) return 'D';
  if (num >= 50) return 'E';
  return 'F';
};

const Results = () => {
  const { currentSchool } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [termId, setTermId] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [resRes, stRes, subRes, termRes] = await Promise.allSettled([
        api.get('/results/'),
        api.get('/students/'),
        api.get('/subjects/'),
        api.get('/terms/'),
      ]);

      if (resRes.status === 'fulfilled') setResults(resRes.value.data || []);
      if (stRes.status === 'fulfilled') setStudents(stRes.value.data || []);
      if (subRes.status === 'fulfilled') setSubjects(subRes.value.data || []);
      if (termRes.status === 'fulfilled') setTerms(termRes.value.data || []);
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
    setStudentId(students.length > 0 ? String(students[0].id) : '');
    setSubjectId(subjects.length > 0 ? String(subjects[0].id) : '');
    setTermId(terms.length > 0 ? String(terms[0].id) : '');
    setScore('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      setErrorMsg('Score must be a number between 0 and 100.');
      return;
    }

    if (!studentId || !subjectId || !termId) {
      setErrorMsg('Please select a student, subject, and term.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/results/', {
        student_id: parseInt(studentId, 10),
        subject_id: parseInt(subjectId, 10),
        term_id: parseInt(termId, 10),
        score: numericScore,
      });

      setShowModal(false);
      await loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to save result.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result entry?')) return;
    try {
      await api.delete(`/results/${id}`);
      await loadData();
    } catch {
      alert('Failed to delete result.');
    }
  };

  const getStudentDisplay = (sId) => {
    const found = students.find((s) => s.id === sId);
    return found ? `${found.first_name} ${found.last_name} (${found.code})` : `Student #${sId}`;
  };

  const getSubjectName = (subId) => {
    const found = subjects.find((s) => s.id === subId);
    return found ? found.name : `Subject #${subId}`;
  };

  const getTermName = (tId) => {
    const found = terms.find((t) => t.id === tId);
    return found ? found.name : `Term #${tId}`;
  };

  const filtered = results.filter((r) => {
    const studentText = getStudentDisplay(r.student_id).toLowerCase();
    const matchesSearch = studentText.includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter ? String(r.subject_id) === String(subjectFilter) : true;
    const matchesTerm = termFilter ? String(r.term_id) === String(termFilter) : true;
    return matchesSearch && matchesSubject && matchesTerm;
  });

  const previewGrade = calculatePreviewGrade(score);

  if (!currentSchool) {
    return (
      <div className="empty-state">
        <Award size={48} />
        <h3>Please select or create a school first</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Results & Grade Management</h1>
          <p className="page-subtitle">
            Enter test and exam scores with automated letter grade calculation for {currentSchool.name}.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Record New Result</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ width: '280px' }}>
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
          Showing <strong>{filtered.length}</strong> recorded scores
        </div>
      </div>

      {/* Results Table */}
      <div className="spms-table-wrapper">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading results...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Award size={40} />
            <h3>No results found</h3>
            <p>
              {searchTerm || subjectFilter || termFilter
                ? 'No evaluations match your active filters.'
                : 'Enter assessment marks to generate automated grade records.'}
            </p>
            {!searchTerm && !subjectFilter && !termFilter && (
              <button onClick={openCreateModal} className="btn btn-primary btn-sm">
                Record First Score
              </button>
            )}
          </div>
        ) : (
          <table className="spms-table">
            <thead>
              <tr>
                <th>Result #</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Academic Term</th>
                <th>Raw Score</th>
                <th>Automated Grade</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const grade = (r.grade || 'F').toUpperCase();
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: '600', color: '#64748b' }}>#{r.id}</td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>
                      {getStudentDisplay(r.student_id)}
                    </td>
                    <td>{getSubjectName(r.subject_id)}</td>
                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#475569',
                      }}>
                        {getTermName(r.term_id)}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', fontSize: '15px' }}>{r.score}%</td>
                    <td>
                      <span className={`spms-badge badge-grade-${grade}`}>
                        Grade {grade}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Result"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                Record Student Result
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
                  <label className="form-label">Student *</label>
                  {students.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#ef4444' }}>
                      No students registered. Please enroll a student first.
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    {subjects.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#ef4444' }}>No subjects.</div>
                    ) : (
                      <select
                        className="form-select"
                        required
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Term *</label>
                    {terms.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#ef4444' }}>No terms.</div>
                    ) : (
                      <select
                        className="form-select"
                        required
                        value={termId}
                        onChange={(e) => setTermId(e.target.value)}
                      >
                        {terms.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Numerical Score (0 - 100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    placeholder="e.g. 85.5"
                    className="form-input"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>

                {/* Live Grade Preview */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#4f46e5" />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                      Automated Grade Scale:
                    </span>
                  </div>
                  <span className={`spms-badge badge-grade-${previewGrade !== '-' ? previewGrade : 'F'}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
                    Grade {previewGrade}
                  </span>
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
                  disabled={submitting || students.length === 0 || subjects.length === 0 || terms.length === 0}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : 'Record Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
