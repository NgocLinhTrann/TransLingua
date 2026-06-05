import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Send, MessageSquare, AlertCircle, CheckCircle2, User, Calendar, ShieldCheck } from 'lucide-react';

export default function Feedback() {
    const [content, setContent] = useState('');
    const [feedbackList, setFeedbackList] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'admin') {
                fetchFeedbackList();
            }
        }
    }, []);

    const fetchFeedbackList = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbackList(response.data);
        } catch (err) {
            setError('Failed to load feedback list');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!content.trim()) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.post('/api/feedback', 
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Thank you! Your feedback has been submitted successfully.');
            setContent('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user && user.role === 'admin';

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h1 className="dashboard-title">System Feedback</h1>
                    {isAdmin && (
                        <div className="user-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                            <ShieldCheck size={14} />
                            <span>Admin Mode</span>
                        </div>
                    )}
                </div>
                <p className="dashboard-desc">
                    {isAdmin 
                        ? 'Review feedback and feature requests submitted by users regarding system usability.' 
                        : 'Submit feature suggestions, bug reports, or visual feedback to help improve TransLingua.'}
                </p>

                {isAdmin ? (
                    /* Admin Feedback View */
                    <div className="preview-container" style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0 }}>User Feedback List</h3>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={18} />
                                <div>{error}</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {feedbackList.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                                    No feedback submissions found.
                                </p>
                            ) : (
                                feedbackList.map(item => (
                                    <div key={item.feedback_id} style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '20px',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                            marginBottom: '12px',
                                            borderBottom: '1px solid var(--border)',
                                            paddingBottom: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} />
                                                <span>{item.email}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} />
                                                <span>{new Date(item.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                            {item.content}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* User Submission Form */
                    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '24px' }}>
                        <div className="upload-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
                                <h3 style={{ margin: 0 }}>Provide Us Feedback</h3>
                            </div>

                            {error && (
                                <div className="alert alert-error">
                                    <AlertCircle size={18} />
                                    <div>{error}</div>
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    <CheckCircle2 size={18} />
                                    <div>{success}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="form-label">Feedback Details</label>
                                    <textarea
                                        className="form-input"
                                        rows="6"
                                        placeholder="Describe your suggestion or issue in detail..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        style={{ paddingLeft: '16px', resize: 'vertical' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <Send size={18} />
                                    {loading ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
