import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import DictionaryList from './components/DictionaryList';
import TranslationMemory from './components/TranslationMemory';
import Glossary from './components/Glossary';
import Feedback from './components/Feedback';
import TasksTracker from './components/TasksTracker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dictionary" element={<DictionaryList />} />
        <Route path="/translation-memory" element={<TranslationMemory />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/tasks" element={<TasksTracker />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
