import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Plus, Edit2, Trash2, Search, AlertCircle, Save, X } from 'lucide-react';

export default function TranslationMemory() {
    const [entries, setEntries] = useState([]);
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editOriginal, setEditOriginal] = useState('');
    const [editTranslated, setEditTranslated] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/translations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(response.data);
        } catch (err) {
            setError('Failed to fetch translation entries');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!originalText || !translatedText) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/translations', 
                { original_text: originalText, translated_text: translatedText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEntries([response.data, ...entries]);
            setOriginalText('');
            setTranslatedText('');
            setSuccess('Translation memory entry added successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add entry');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (entry) => {
        setEditingId(entry.id);
        setEditOriginal(entry.original_text);
        setEditTranslated(entry.translated_text);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditOriginal('');
        setEditTranslated('');
    };

    const handleSaveEdit = async (id) => {
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/translations/${id}`,
                { original_text: editOriginal, translated_text: editTranslated },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEntries(entries.map(e => e.id === id ? response.data : e));
            setEditingId(null);
            setSuccess('Entry updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update entry');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this translation memory entry?')) return;
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/translations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(entries.filter(e => e.id !== id));
            setSuccess('Entry deleted successfully!');
        } catch (err) {
            setError('Failed to delete entry');
        }
    };

    const filteredEntries = entries.filter(entry => 
        entry.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.translated_text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <h1 className="dashboard-title">Translation Memory</h1>
                <p className="dashboard-desc">Manage your custom translation memories to maintain consistent translations across files.</p>

                <div className="dashboard-grid">
                    <div className="upload-card">
                        <h3 style={{ marginBottom: '20px' }}>Add Translation Entry</h3>
                        
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
                                <label className="form-label">Chinese Text (Original)</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    placeholder="Enter Chinese source text..."
                                    value={originalText}
                                    onChange={(e) => setOriginalText(e.target.value)}
                                    style={{ paddingLeft: '16px', resize: 'vertical' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Vietnamese Translation</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    placeholder="Enter Vietnamese translation..."
                                    value={translatedText}
                                    onChange={(e) => setTranslatedText(e.target.value)}
                                    style={{ paddingLeft: '16px', resize: 'vertical' }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Plus size={18} />
                                {loading ? 'Adding...' : 'Add to Translation Memory'}
                            </button>
                        </form>
                    </div>

                    <div className="stats-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Memory Entries</h3>
                            <div className="user-badge">{entries.length} Total</div>
                        </div>
                        <div className="form-input-wrapper" style={{ marginTop: '10px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search translation memory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="form-input-icon" size={18} />
                        </div>
                    </div>
                </div>

                <div className="preview-container" style={{ marginTop: '40px' }}>
                    <h3>Translation Registry</h3>
                    <div className="table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Chinese Term (Original)</th>
                                    <th style={{ width: '40%' }}>Vietnamese Translation</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No translation memory entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map(entry => (
                                        <tr key={entry.id}>
                                            {editingId === entry.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={editOriginal}
                                                            onChange={(e) => setEditOriginal(e.target.value)}
                                                            style={{ paddingLeft: '12px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={editTranslated}
                                                            onChange={(e) => setEditTranslated(e.target.value)}
                                                            style={{ paddingLeft: '12px' }}
                                                        />
                                                    </td>
                                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', borderBottom: 'none', height: '100%' }}>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ width: 'auto', padding: '6px', color: 'var(--success)' }}
                                                            onClick={() => handleSaveEdit(entry.id)}
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
                                                    <td style={{ whiteSpace: 'pre-wrap' }}>{entry.original_text}</td>
                                                    <td style={{ whiteSpace: 'pre-wrap' }}>{entry.translated_text}</td>
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
                                                                onClick={() => handleDelete(entry.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
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
