import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { ListTodo, FileSpreadsheet, CheckCircle, Calendar, RefreshCw } from 'lucide-react';

export default function TasksTracker() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load import tasks log');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h1 className="dashboard-title">Import History</h1>
                    <button 
                        onClick={fetchTasks} 
                        className="btn btn-secondary" 
                        disabled={loading}
                        style={{ width: 'auto', padding: '8px 16px', display: 'flex', gap: '8px', fontSize: '0.9rem' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh Logs
                    </button>
                </div>
                <p className="dashboard-desc">Track and review your past dictionary uploads and import statistics.</p>

                <div className="preview-container" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <ListTodo size={20} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ margin: 0 }}>Import Activity Logs</h3>
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                            <div>{error}</div>
                        </div>
                    )}

                    <div className="table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>Task ID</th>
                                    <th style={{ width: '40%' }}>File Name</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Total Terms</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>Completed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Loading activity logs...
                                        </td>
                                    </tr>
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No import tasks logged yet. Try uploading a spreadsheet from the dashboard!
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map(task => (
                                        <tr key={task.task_id}>
                                            <td>#{task.task_id}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FileSpreadsheet size={16} style={{ color: 'var(--success)' }} />
                                                    <span>{task.file_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '4px',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    color: 'var(--success)'
                                                }}>
                                                    <CheckCircle size={12} />
                                                    <span style={{ textTransform: 'capitalize' }}>{task.status}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                {task.total_terms}
                                            </td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={12} />
                                                    <span>{new Date(task.created_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
