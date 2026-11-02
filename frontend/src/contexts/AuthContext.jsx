// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [schools, setSchools] = useState([]);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch schools for the logged-in user
  const fetchSchools = useCallback(async () => {
    try {
      const res = await api.get('/schools/');
      const list = Array.isArray(res.data) ? res.data : [];
      setSchools(list);

      const savedSchoolId = localStorage.getItem('spms_school_id');
      if (savedSchoolId) {
        const found = list.find((s) => String(s.id) === String(savedSchoolId));
        if (found) {
          setCurrentSchool(found);
          return found;
        }
      }

      if (list.length > 0) {
        setCurrentSchool(list[0]);
        localStorage.setItem('spms_school_id', String(list[0].id));
        return list[0];
      } else {
        setCurrentSchool(null);
        localStorage.removeItem('spms_school_id');
        return null;
      }
    } catch (err) {
      // If 401 or network error
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('spms_user');
        localStorage.removeItem('spms_school_id');
      }
      setSchools([]);
      setCurrentSchool(null);
      return null;
    }
  }, []);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('spms_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          await fetchSchools();
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchSchools]);

  // Login handler using OAuth2 x-www-form-urlencoded
  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email.trim());
    params.append('password', password);

    await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const userData = { email: email.trim() };
    setUser(userData);
    localStorage.setItem('spms_user', JSON.stringify(userData));

    // Load user's schools
    await fetchSchools();
    navigate('/');
  };

  // Register handler
  const register = async (email, password) => {
    await api.post('/auth/register', {
      email: email.trim(),
      password: password,
    });
    // Immediately log in after registration
    await login(email, password);
  };

  // Switch active school
  const selectSchool = (schoolId) => {
    const found = schools.find((s) => String(s.id) === String(schoolId));
    if (found) {
      setCurrentSchool(found);
      localStorage.setItem('spms_school_id', String(found.id));
      window.location.reload(); // Refresh data with new school header
    }
  };

  // Create a new school
  const createSchool = async (name) => {
    const res = await api.post('/schools/', { name });
    const newSchool = res.data;
    await fetchSchools();
    setCurrentSchool(newSchool);
    localStorage.setItem('spms_school_id', String(newSchool.id));
    return newSchool;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    setSchools([]);
    setCurrentSchool(null);
    localStorage.removeItem('spms_user');
    localStorage.removeItem('spms_school_id');
    navigate('/login');
  };

  const value = {
    user,
    schools,
    currentSchool,
    loading,
    login,
    register,
    logout,
    selectSchool,
    createSchool,
    refreshSchools: fetchSchools,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
