// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
