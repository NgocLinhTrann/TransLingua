import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { 
    Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw, FileText
} from 'lucide-react';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [importedEntries, setImportedEntries] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token || !storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError('');
        setSuccess('');
        setImportedEntries([]);

        // Animate progress simulation
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + Math.floor(Math.random() * 8) + 2;
            });
        }, 80);

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            clearInterval(interval);
            setProgress(100);
            
            setTimeout(() => {
                setSuccess(response.data.message);
                setImportedEntries(response.data.entries || []);
                setFile(null);
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 300);
            
        } catch (err) {
            clearInterval(interval);
            setUploading(false);
            setError(err.response?.data?.message || 'File upload failed. Please try again.');
        }
    };

    if (!user) return null;

    return (
        <div className="app-container">
            <Navbar />

            <main className="main-content">
                <h1 className="dashboard-title">Dictionary Upload</h1>
                <p className="dashboard-desc">Upload your Chinese-Vietnamese translation spreadsheet to import terms directly to your dictionary.</p>

                <div className="dashboard-grid">
                    <div className="upload-card">
                        <h3 style={{ marginBottom: '20px' }}>Upload Excel Spreadsheet</h3>

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                <div>{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <CheckCircle size={18} style={{ flexShrink: 0 }} />
                                <div>{success}</div>
                            </div>
                        )}

                        <form onSubmit={handleUpload}>
                            <div 
                                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                style={{ pointerEvents: uploading ? 'none' : 'auto' }}
                            >
                                <input 
                                    ref={fileInputRef}
                                    id="file-upload-input"
                                    type="file" 
                                    style={{ display: 'none' }}
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <div className="upload-icon-container">
                                    <Upload size={28} />
                                </div>
                                <p>Drag and drop your Excel file here, or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Browse</span></p>
                                <span className="file-hint">Supports .xlsx and .xls formats with Chinese and Vietnamese columns</span>
                            </div>

                            {file && (
                                <div className="file-details">
                                    <div className="file-info">
                                        <FileSpreadsheet className="excel-icon" size={24} />
                                        <div>
                                            <div className="file-name">{file.name}</div>
                                            <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                    {!uploading && (
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setFile(null); 
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}

                            {uploading && (
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        <span>Importing and parsing spreadsheet...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${progress}%`, 
                                            height: '100%', 
                                            background: 'var(--accent-gradient)', 
                                            borderRadius: '4px',
                                            transition: 'width 0.1s ease-out' 
                                        }}></div>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={!file || uploading}
                            >
                                {uploading ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Import to Dictionary
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="stats-card">
                        <h3>Dictionary Statistics</h3>
                        <div className="stat-item">
                            <div className="stat-icon accent">
                                <FileText size={20} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{importedEntries.length}</div>
                                <div className="stat-label">Entries in latest import</div>
                            </div>
                        </div>
                    </div>
                </div>

                {importedEntries.length > 0 && (
                    <div className="preview-container" style={{ marginTop: '40px' }}>
                        <h3>Imported Entries Preview</h3>
                        <div className="table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Chinese Term (Original)</th>
                                        <th>Vietnamese Translation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importedEntries.map((entry, idx) => (
                                        <tr key={entry.dict_id || idx}>
                                            <td>{entry.dict_id || idx + 1}</td>
                                            <td>{entry.term}</td>
                                            <td>{entry.translation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1.2s linear infinite;
                }
            `}</style>
        </div>
    );
}
