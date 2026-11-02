// src/components/TopBar.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Building2, Plus, Sparkles, Smartphone, Check } from 'lucide-react';

const TopBar = () => {
  const { user, schools, currentSchool, selectSchool, createSchool } = useContext(AuthContext);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setCreating(true);
    try {
      await createSchool(newSchoolName.trim());
      setNewSchoolName('');
      setShowSchoolModal(false);
    } catch {
      alert('Failed to register school. Please verify your connection.');
    } finally {
      setCreating(false);
    }
  };

  const localIp = window.location.hostname;

  return (
    <>
      <header style={{
        height: '66px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        flexShrink: 0,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}>
        {/* Left: System Status & Mobile Access Tip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f0fdfa',
            color: '#0f766e',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '700',
            border: '1px solid #99f6e4',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              boxShadow: '0 0 0 2px #d1fae5',
            }} />
            <span>FastAPI Live: http://{localIp}:8000</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748b',
          }} className="hide-on-mobile">
            <Smartphone size={14} color="#0f766e" />
            <span>Mobile/Network Ready: <strong>http://192.168.214.124:5173</strong></span>
          </div>
        </div>

        {/* Right: School Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* School Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#0f766e" />
            <select
              value={currentSchool ? currentSchool.id : ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setShowSchoolModal(true);
                } else if (e.target.value) {
                  selectSchool(e.target.value);
                }
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '13px',
                fontWeight: '700',
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {schools.length === 0 && <option value="">No Schools Registered</option>}
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} (ID: #{school.id})
                </option>
              ))}
              <option value="new">+ Register New School...</option>
            </select>
          </div>

          <button
            onClick={() => setShowSchoolModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Register School</span>
          </button>
        </div>
      </header>

      {/* Modal for Creating New School */}
      {showSchoolModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Register New Institution
              </h3>
              <button
                type="button"
                onClick={() => setShowSchoolModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateSchool}>
              <div className="modal-body">
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                  Create any school, academy, or international institution. All students, classes, and results will be segregated under this institution.
                </p>
                <div className="form-group">
                  <label className="form-label">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood International School"
                    className="form-input"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSchoolModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary"
                >
                  {creating ? 'Registering...' : 'Register School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
