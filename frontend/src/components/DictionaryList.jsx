import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, Save, X, BookOpen } from 'lucide-react';

export default function DictionaryList() {
    const [terms, setTerms] = useState([]);
    const [term, setTerm] = useState('');
    const [translation, setTranslation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTerm, setEditTerm] = useState('');
    const [editTranslation, setEditTranslation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [newlyAddedId, setNewlyAddedId] = useState(null);

    useEffect(() => {
        fetchTerms();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchTerms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/dictionary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTerms(response.data);
        } catch (err) {
            setError('Failed to fetch dictionary terms');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!term || !translation) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/dictionary', 
                { term, translation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTerms([response.data, ...terms]);
            setTerm('');
            setTranslation('');
            setSuccess('Dictionary entry added successfully!');
            setNewlyAddedId(response.data.dict_id);
            setTimeout(() => {
                setNewlyAddedId(null);
            }, 6000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add dictionary entry');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (entry) => {
        setEditingId(entry.dict_id);
        setEditTerm(entry.term);
        setEditTranslation(entry.translation);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTerm('');
        setEditTranslation('');
    };

    const handleSaveEdit = async (id) => {
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/dictionary/${id}`,
                { term: editTerm, translation: editTranslation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTerms(terms.map(t => t.dict_id === id ? response.data : t));
            setEditingId(null);
            setSuccess('Dictionary entry updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update dictionary entry');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this dictionary entry?')) return;
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/dictionary/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTerms(terms.filter(t => t.dict_id !== id));
            setSuccess('Dictionary entry deleted successfully!');
        } catch (err) {
            setError('Failed to delete dictionary entry');
        }
    };

    const filteredTerms = terms.filter(entry => 
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app-container">
            <Navbar />
            
            {/* Floating Toast Container */}
            <div className="toast-container">
                {success && (
                    <div className="toast-notification toast-success">
                        <CheckCircle size={18} />
                        <div>{success}</div>
                    </div>
                )}
                {error && (
                    <div className="toast-notification toast-error">
                        <AlertCircle size={18} />
                        <div>{error}</div>
                    </div>
                )}
            </div>

            <main className="main-content">
                <h1 className="dashboard-title">Personal Dictionary</h1>
                <p className="dashboard-desc">Manage your custom vocabulary terms. You can add terms manually or review terms imported via Excel.</p>

                <div className="dashboard-grid">
                    <div className="upload-card">
                        <h3 style={{ marginBottom: '20px' }}>Add Personal Word</h3>

                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label className="form-label">Chinese Term (Original)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 欢迎"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    style={{ paddingLeft: '16px' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Vietnamese Translation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. chào mừng"
                                    value={translation}
                                    onChange={(e) => setTranslation(e.target.value)}
                                    style={{ paddingLeft: '16px' }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Plus size={18} />
                                {loading ? 'Adding...' : 'Add Word'}
                            </button>
                        </form>
                    </div>

                    <div className="stats-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Vocabulary Inventory</h3>
                            <div className="user-badge">{terms.length} Words</div>
                        </div>
                        <div className="form-input-wrapper" style={{ marginTop: '10px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search dictionary terms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="form-input-icon" size={18} />
                        </div>
                    </div>
                </div>

                <div className="preview-container" style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0 }}>Dictionary Listing</h3>
                        </div>
                        <div className="user-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', border: '1px solid var(--border-glow)' }}>
                            Total Count: {terms.length} {terms.length === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '8%' }}>#</th>
                                    <th style={{ width: '42%' }}>Chinese Term</th>
                                    <th style={{ width: '35%' }}>Vietnamese Translation</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTerms.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No terms found in your dictionary.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTerms.map((entry, idx) => {
                                        const isNew = entry.dict_id === newlyAddedId;
                                        return (
                                            <tr key={entry.dict_id} className={isNew ? "row-highlight-new" : ""}>
                                                <td style={{ fontWeight: '600', color: isNew ? 'var(--success)' : 'var(--text-muted)' }}>{idx + 1}</td>
                                                {editingId === entry.dict_id ? (
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
                                                                onClick={() => handleSaveEdit(entry.dict_id)}
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
                                                        <td style={{ color: isNew ? 'var(--success)' : 'inherit', fontWeight: isNew ? '600' : 'normal' }}>{entry.term}</td>
                                                        <td style={{ color: isNew ? 'var(--success)' : 'inherit', fontWeight: isNew ? '600' : 'normal' }}>{entry.translation}</td>
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
                                                                    onClick={() => handleDelete(entry.dict_id)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
