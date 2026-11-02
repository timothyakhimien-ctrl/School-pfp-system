// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid email or password. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin_test@school.com');
    setPassword('newpassword123');
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
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(0,0,0,0) 70%)',
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
            <span>Commercial-Grade Multi-School System</span>
          </div>

          <h2 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Precision Grading & Student Performance Insights
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#ccfbf1', maxWidth: '480px', marginBottom: '36px' }}>
            A unified academic management ecosystem engineered for modern schools, principals, and educators.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Universal school creation: configure any institution name instantly',
              'Automated letter grading (A through F) with instant calculations',
              'Real-time class distribution and longitudinal performance charts',
              'Secure password recovery with 6-digit email security codes',
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
            Session Secured &bull; Multi-Tenant Architecture &bull; Production Ready
          </span>
        </div>
      </div>

      {/* Right Login Form */}
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
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Sign in to manage your school and student records.
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

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: '700', color: '#0f766e' }}>
                  Forgot Password?
                </Link>
              </div>
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
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div style={{
            marginTop: '24px',
            padding: '12px 14px',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748b',
          }}>
            <span>Testing with preloaded account:</span>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: '#f0fdfa',
                color: '#0f766e',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #99f6e4',
                cursor: 'pointer',
              }}
            >
              Fill Credentials
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#64748b' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ fontWeight: '700', color: '#0f766e' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
