import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Plus, Edit2, Trash2, Search, AlertCircle, Save, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Glossary() {
    const [terms, setTerms] = useState([]);
    const [term, setTerm] = useState('');
    const [translation, setTranslation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTerm, setEditTerm] = useState('');
    const [editTranslation, setEditTranslation] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/glossary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTerms(response.data);
        } catch (err) {
            setError('Failed to fetch glossary terms');
        }
    };

    const isAdmin = user && user.role === 'admin';

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        setError('');
        setSuccess('');
        if (!term || !translation) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/glossary', 
                { term, translation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTerms([response.data, ...terms].sort((a,b) => a.term.localeCompare(b.term)));
            setTerm('');
            setTranslation('');
            setSuccess('Glossary term added successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add glossary term');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (entry) => {
        if (!isAdmin) return;
        setEditingId(entry.term_id);
        setEditTerm(entry.term);
        setEditTranslation(entry.translation);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTerm('');
        setEditTranslation('');
    };

    const handleSaveEdit = async (id) => {
        if (!isAdmin) return;
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/glossary/${id}`,
                { term: editTerm, translation: editTranslation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTerms(terms.map(t => t.term_id === id ? response.data : t).sort((a,b) => a.term.localeCompare(b.term)));
            setEditingId(null);
            setSuccess('Glossary term updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update glossary term');
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        if (!window.confirm('Are you sure you want to delete this glossary term?')) return;
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/glossary/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTerms(terms.filter(t => t.term_id !== id));
            setSuccess('Glossary term deleted successfully!');
        } catch (err) {
            setError('Failed to delete glossary term');
        }
    };

    const filteredTerms = terms.filter(entry => 
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h1 className="dashboard-title">Standard Glossary</h1>
                    {isAdmin ? (
                        <div className="user-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                            <ShieldCheck size={14} />
                            <span>Admin Mode</span>
                        </div>
                    ) : (
                        <div className="user-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                            <ShieldAlert size={14} />
                            <span>View Only</span>
                        </div>
                    )}
                </div>
                <p className="dashboard-desc">Reference standardized language terms approved by administrators to maintain consistent phrasing.</p>

                <div className="dashboard-grid">
                    {isAdmin ? (
                        <div className="upload-card">
                            <h3 style={{ marginBottom: '20px' }}>Add Glossary Entry</h3>
                            
                            {error && (
                                <div className="alert alert-error">
                                    <AlertCircle size={18} />
                                    <div>{error}</div>
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    <AlertCircle size={18} />
                                    <div>{success}</div>
                                </div>
                            )}

                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label className="form-label">Chinese Term</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 确认"
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        style={{ paddingLeft: '16px' }}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="form-label">Standard Translation (Vietnamese)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. xác nhận"
                                        value={translation}
                                        onChange={(e) => setTranslation(e.target.value)}
                                        style={{ paddingLeft: '16px' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <Plus size={18} />
                                    {loading ? 'Adding...' : 'Add Standard Term'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="upload-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: 0.8 }}>
                            <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                            <h3>Glossary Modification Restricted</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px', marginTop: '8px' }}>
                                Only administrators can add, edit, or delete entries in the standard glossary database.
                            </p>
                        </div>
                    )}

                    <div className="stats-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Glossary Database</h3>
                            <div className="user-badge">{terms.length} Terms</div>
                        </div>
                        <div className="form-input-wrapper" style={{ marginTop: '10px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search standard glossary..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="form-input-icon" size={18} />
                        </div>
                    </div>
                </div>

                <div className="preview-container" style={{ marginTop: '40px' }}>
                    <h3>Standard Reference</h3>
                    <div className="table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Standard Chinese Term</th>
                                    <th style={{ width: '40%' }}>Approved Vietnamese Translation</th>
                                    {isAdmin && <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTerms.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 3 : 2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No standard glossary terms found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTerms.map(entry => (
                                        <tr key={entry.term_id}>
                                            {editingId === entry.term_id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={editTerm}
                                                            onChange={(e) => setEditTerm(e.target.value)}
                                                            style={{ paddingLeft: '12px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={editTranslation}
                                                            onChange={(e) => setEditTranslation(e.target.value)}
                                                            style={{ paddingLeft: '12px' }}
                                                        />
                                                    </td>
                                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', borderBottom: 'none', height: '100%' }}>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ width: 'auto', padding: '6px', color: 'var(--success)' }}
                                                            onClick={() => handleSaveEdit(entry.term_id)}
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ width: 'auto', padding: '6px', color: 'var(--error)' }}
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{entry.term}</td>
                                                    <td>{entry.translation}</td>
                                                    {isAdmin && (
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    style={{ width: 'auto', padding: '6px', borderColor: 'transparent' }}
                                                                    onClick={() => handleStartEdit(entry)}
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    style={{ width: 'auto', padding: '6px', borderColor: 'transparent', color: 'var(--error)' }}
                                                                    onClick={() => handleDelete(entry.term_id)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
