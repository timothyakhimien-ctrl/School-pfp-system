// src/pages/Settings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/client';
import { Settings as SettingsIcon, Building2, User, Activity, Plus, Check, ShieldCheck, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, schools, currentSchool, selectSchool, createSchool, logout } = useContext(AuthContext);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  // Backend Health Status
  const [backendStatus, setBackendStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  const checkHealth = async () => {
    setBackendStatus('checking');
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const end = performance.now();
      if (res.data?.status === 'ok') {
        setBackendStatus('connected');
        setLatency(Math.round(end - start));
      } else {
        setBackendStatus('degraded');
      }
    } catch {
      setBackendStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleAddSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setCreating(true);
    setMsg('');
    try {
      await createSchool(newSchoolName.trim());
      setNewSchoolName('');
      setMsg('School registered successfully!');
    } catch {
      setMsg('Failed to create school.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">School & System Settings</h1>
          <p className="page-subtitle">
            Manage your schools, user session, and inspect API connectivity.
          </p>
        </div>
      </div>

      {/* User Session Card */}
      <div className="spms-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#e0e7ff',
            color: '#4338ca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              User Credentials & Session
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Authenticated via FastAPI HttpOnly cookie</span>
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Email Address</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Access Level</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>School Administrator</span>
          </div>
        </div>

        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* School Management Card */}
      <div className="spms-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Registered Schools & Multi-Tenancy
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Switch or create school organizations</span>
          </div>
        </div>

        {/* Existing Schools List */}
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>Your Schools</label>
          {schools.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#64748b', padding: '10px 0' }}>
              No schools registered. Add a school below to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {schools.map((s) => {
                const isActive = currentSchool && currentSchool.id === s.id;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                      background: isActive ? '#f5f3ff' : '#ffffff',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {s.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
                        (School ID: {s.id})
                      </span>
                    </div>

                    {isActive ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#4f46e5',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}>
                        <Check size={16} /> Active School
                      </span>
                    ) : (
                      <button
                        onClick={() => selectSchool(s.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        Switch to this School
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add School Form */}
        <form onSubmit={handleAddSchool} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <label className="form-label">Register Another School</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              required
              placeholder="e.g. St. Jude High School"
              className="form-input"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
            />
            <button type="submit" disabled={creating} className="btn btn-primary">
              <Plus size={16} />
              <span>{creating ? 'Adding...' : 'Add School'}</span>
            </button>
          </div>
          {msg && (
            <span style={{ fontSize: '13px', color: '#059669', display: 'block', marginTop: '8px' }}>
              {msg}
            </span>
          )}
        </form>
      </div>

      {/* Backend Diagnostics */}
      <div className="spms-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Backend Health & Connectivity
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Diagnostic status of FastAPI services</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
              FastAPI Endpoint (http://localhost:8000)
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Status: <strong>{backendStatus.toUpperCase()}</strong> {latency !== null && `(${latency}ms latency)`}
            </div>
          </div>

          <button onClick={checkHealth} className="btn btn-secondary btn-sm">
            Ping Server
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
