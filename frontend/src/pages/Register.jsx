// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: '#f8fafc',
    }}>
      {/* Left Academic Showcase */}
      <div style={{
        flex: '1.15',
        background: 'linear-gradient(145deg, #042f2e 0%, #064e3b 50%, #0f766e 100%)',
        color: '#ffffff',
        padding: '60px 52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="hide-on-mobile">
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '44px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <GraduationCap size={28} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', display: 'block', color: '#ffffff' }}>EduTrack</span>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#99f6e4', fontWeight: '700' }}>
                Academic Performance Suite
              </span>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fef3c7',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '20px',
          }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Create Your Administrator Account</span>
          </div>

          <h2 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Empower Your School With Real-Time Analytics
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#ccfbf1', maxWidth: '480px', marginBottom: '36px' }}>
            Register in seconds to set up your school profile, configure classes, register students, and record examination grades.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Unlimited school registration & multi-cohort structure',
              'Automated scale calculations across standard Nigerian & international grading',
              'Instant grade sheet distribution charts & performance reports',
              'Fast local & mobile network compatibility',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={18} color="#2dd4bf" />
                <span style={{ fontSize: '14px', color: '#f0fdfa' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '40px',
        }}>
          <ShieldCheck size={24} color="#34d399" />
          <span style={{ fontSize: '13px', color: '#ccfbf1' }}>
            Encrypted Authentication &bull; Multi-Tenant Database &bull; High Reliability
          </span>
        </div>
      </div>

      {/* Right Registration Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Create an account
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Enter your email and chosen password to get started.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Password (min. 6 characters)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                borderRadius: '10px',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '700', color: '#0f766e' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
