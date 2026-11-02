// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { GraduationCap, Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request Code, 2: Enter Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const navigate = useNavigate();

  // Step 1: Request recovery code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setInfoMsg(res.data?.msg || 'Recovery code generated.');
      if (res.data?.preview_code) {
        setPreviewCode(res.data.preview_code);
        setCode(res.data.preview_code); // Auto-fill for convenience
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Code & New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
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
      {/* Left Prestige Showcase */}
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

          <h2 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Account Security & Recovery Portal
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#ccfbf1', maxWidth: '480px', marginBottom: '36px' }}>
            Regain immediate access to your school administrative portal using 6-digit email authentication codes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Direct email verification code sent to your registered address',
              'Fast self-service password update with encrypted Argon2 protection',
              'Immediate access restoration to all school and student records',
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
          <KeyRound size={22} color="#34d399" />
          <span style={{ fontSize: '13px', color: '#ccfbf1' }}>
            Zero-Wait Self Recovery &bull; Encrypted Password Storage &bull; Secure Tokens
          </span>
        </div>
      </div>

      {/* Right Form Area */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f766e', fontWeight: '700', marginBottom: '16px' }}>
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
                <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  Forgot Password?
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Enter your registered email address and we'll send you a 6-digit recovery code.
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

              <form onSubmit={handleRequestCode}>
                <div className="form-group" style={{ marginBottom: '22px' }}>
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
                      autoFocus
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
                  {loading ? 'Sending Code...' : 'Send Recovery Code'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0f766e', letterSpacing: '0.06em' }}>
                  Step 2 of 2
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '4px', marginBottom: '8px' }}>
                  Reset Password
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  We sent a 6-digit security code to <strong>{email}</strong>.
                </p>
              </div>

              {previewCode && (
                <div style={{
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#0f766e',
                }}>
                  <span>Security Code: <strong>{previewCode}</strong></span>
                  <span style={{ fontSize: '11px', background: '#ccfbf1', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    Auto-Filled
                  </span>
                </div>
              )}

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

              <form onSubmit={handleResetPassword}>
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">6-Digit Verification Code</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <KeyRound size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="form-input"
                      style={{ paddingLeft: '38px', letterSpacing: '0.2em', fontWeight: '700', fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">New Password (min. 6 characters)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <label className="form-label">Confirm New Password</label>
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
                  {loading ? 'Updating Password...' : 'Update Password & Sign In'}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Password Updated!
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: 1.5 }}>
                Your account password has been changed successfully. You can now sign in with your new credentials.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '15px' }}>
                Proceed to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
