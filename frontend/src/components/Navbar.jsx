import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Database, BookOpen, Layers, MessageSquare, ListTodo, Home, GraduationCap } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <header className="app-header">
            <div className="header-logo">
                <Database size={24} style={{ color: 'var(--accent)' }} />
                TransLingua
            </div>
            <nav className="header-nav">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Home size={16} />
                    Upload
                </NavLink>
                <NavLink to="/dictionary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} />
                    Dictionary
                </NavLink>
                <NavLink to="/flashcards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={16} />
                    Practice
                </NavLink>
                <NavLink to="/feedback" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} />
                    Feedback
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ListTodo size={16} />
                    Tasks
                </NavLink>
            </nav>
            <div className="header-nav" style={{ gap: '16px' }}>
                <button 
                    onClick={toggleTheme} 
                    className="btn btn-secondary" 
                    style={{ width: '36px', height: '36px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <div className="user-badge" style={{ textTransform: 'none' }}>
                    <User size={14} />
                    <span>{user.email.split('@')[0]} ({user.role})</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '6px 12px', display: 'flex', gap: '6px', fontSize: '0.85rem', height: '36px', alignItems: 'center' }}>
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </header>
    );
}
