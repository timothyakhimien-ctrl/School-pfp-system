// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Users,
  School,
  BookOpen,
  Award,
  TrendingUp,
  Plus,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const GRADE_PALETTE = {
  A: '#059669', // Emerald
  B: '#0f766e', // Deep Teal
  C: '#d97706', // Amber Gold
  D: '#ea580c', // Orange
  E: '#9333ea', // Purple
  F: '#dc2626', // Crimson Red
};

const Dashboard = () => {
  const { currentSchool, createSchool } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [terms, setTerms] = useState([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [creatingSchool, setCreatingSchool] = useState(false);

  useEffect(() => {
    if (!currentSchool) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [stRes, clRes, subRes, resRes, trmRes] = await Promise.allSettled([
          api.get('/students/'),
          api.get('/classes/'),
          api.get('/subjects/'),
          api.get('/results/'),
          api.get('/terms/'),
        ]);

        if (stRes.status === 'fulfilled') setStudents(stRes.value.data || []);
        if (clRes.status === 'fulfilled') setClasses(clRes.value.data || []);
        if (subRes.status === 'fulfilled') setSubjects(subRes.value.data || []);
        if (resRes.status === 'fulfilled') setResults(resRes.value.data || []);
        if (trmRes.status === 'fulfilled') setTerms(trmRes.value.data || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSchool]);

  // Compute Grade distribution
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let totalScore = 0;

  results.forEach((r) => {
    totalScore += Number(r.score) || 0;
    const g = (r.grade || 'F').toUpperCase();
    if (gradeCounts[g] !== undefined) {
      gradeCounts[g]++;
    } else {
      gradeCounts.F++;
    }
  });

  const avgScore = results.length > 0 ? (totalScore / results.length).toFixed(1) : 'N/A';
  const chartData = Object.keys(gradeCounts).map((grade) => ({
    grade: `Grade ${grade}`,
    key: grade,
    count: gradeCounts[grade],
  }));

  const handleQuickCreateSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setCreatingSchool(true);
    try {
      await createSchool(newSchoolName.trim());
      setNewSchoolName('');
    } catch {
      alert('Failed to register school. Please verify session and try again.');
    } finally {
      setCreatingSchool(false);
    }
  };

  // If user has not created or selected a school yet
  if (!currentSchool) {
    return (
      <div style={{ maxWidth: '680px', margin: '48px auto' }}>
        <div className="spms-card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            border: '1px solid #99f6e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 4px 14px rgba(20, 184, 166, 0.2)',
          }}>
            <School size={36} color="#0f766e" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Welcome to EduTrack SPMS
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
            To begin managing students, academic classes, curriculums, and automated report cards, please enter your institution name below.
          </p>

          <form onSubmit={handleQuickCreateSchool} style={{ display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '520px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="e.g. Greenwood International School"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              required
              className="form-input"
              style={{ padding: '12px 16px', fontSize: '15px' }}
              autoFocus
            />
            <button
              type="submit"
              disabled={creatingSchool}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '15px', flexShrink: 0 }}
            >
              {creatingSchool ? 'Registering...' : 'Register School'}
            </button>
          </form>

          <div style={{
            marginTop: '36px',
            padding: '16px 20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#64748b',
          }}>
            <Sparkles size={16} color="#d97706" />
            <span>Works for any school, college, academy or secondary institution name</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner / Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              background: '#f0fdfa',
              color: '#0f766e',
              border: '1px solid #99f6e4',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Building2 size={13} />
              {currentSchool.name}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: #{currentSchool.id}</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Academic Performance Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Live analytics, student statistics, and automated evaluation metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/students" className="btn btn-secondary btn-sm">
            <Plus size={15} />
            <span>Enroll Student</span>
          </Link>
          <Link to="/results" className="btn btn-primary btn-sm">
            <Award size={15} />
            <span>Record Grade</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>
            <Users size={26} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Enrolled Students</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
              {students.length}
            </div>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>Active Roster</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
            <School size={26} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Classes & Streams</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
              {classes.length}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Configured</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Curriculum Subjects</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
              {subjects.length}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Examinable</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>School GPA / Average</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
              {avgScore}{avgScore !== 'N/A' ? '%' : ''}
            </div>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
              {results.length} total evaluations
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Grade Distribution Chart */}
        <div className="spms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Academic Grade Distribution
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Standard grading tier breakdown across all recorded subjects (A: 90+, B: 80+, C: 70+, D: 60+, E: 50+, F: &lt;50)
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(240, 253, 250, 0.6)' }}
                  contentStyle={{
                    backgroundColor: '#042f2e',
                    borderRadius: '10px',
                    color: '#ffffff',
                    border: '1px solid #14b8a6',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={GRADE_PALETTE[entry.key] || '#0f766e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & School Overview */}
        <div className="spms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px' }}>
              Management Quick Access
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/students"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={18} color="#0f766e" />
                  <span>Student Registry & Profiles</span>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/classes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <School size={18} color="#d97706" />
                  <span>Classes, Streams & Cohorts</span>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>

              <Link
                to="/results"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Award size={18} color="#059669" />
                  <span>Record & Calculate Grades</span>
                </div>
                <ArrowRight size={16} color="#94a3b8" />
              </Link>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
            border: '1px solid #99f6e4',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Sparkles size={22} color="#0f766e" />
            <span style={{ fontSize: '13px', color: '#042f2e', lineHeight: 1.4, fontWeight: '500' }}>
              Automated grading calculations are active. All evaluations compute instantly upon entry.
            </span>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="spms-table-wrapper">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Recent Student Evaluations
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Latest records saved to {currentSchool.name}</span>
          </div>
          <Link to="/results" style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full Grade Sheet <ArrowRight size={14} />
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <Award size={40} color="#0f766e" />
            <h3>No results recorded yet</h3>
            <p>Once examination or test scores are entered, they will appear here with calculated letter grades.</p>
            <Link to="/results" className="btn btn-primary btn-sm">
              Enter First Score
            </Link>
          </div>
        ) : (
          <table className="spms-table">
            <thead>
              <tr>
                <th>Result ID</th>
                <th>Student ID</th>
                <th>Subject ID</th>
                <th>Term ID</th>
                <th>Score</th>
                <th>Calculated Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 6).map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '700', color: '#64748b' }}>#{r.id}</td>
                  <td style={{ fontWeight: '600' }}>Student #{r.student_id}</td>
                  <td>Subject #{r.subject_id}</td>
                  <td>Term #{r.term_id}</td>
                  <td style={{ fontWeight: '800', fontSize: '15px' }}>{r.score}%</td>
                  <td>
                    <span className={`spms-badge badge-grade-${(r.grade || 'F').toUpperCase()}`}>
                      Grade {r.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
