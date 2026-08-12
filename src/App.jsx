import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import './App.css';

export default function App() {
  return (
    <Router>
      <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}