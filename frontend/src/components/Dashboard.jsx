import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { 
    Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw, FileText
} from 'lucide-react';

const WORLD_LANGUAGES = [
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'pa', name: 'Punjabi', flag: '🇵🇰' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'jv', name: 'Javanese', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay/Indonesian', flag: '🇲🇾' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'yue', name: 'Cantonese', flag: '🇭🇰' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'or', name: 'Oriya', flag: '🇮🇳' }
];

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [importedEntries, setImportedEntries] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [user, setUser] = useState(null);
    
    // Multi-Language and Collections config states
    const [sourceLang, setSourceLang] = useState('zh');
    const [targetLang, setTargetLang] = useState('vi');
    const [collections, setCollections] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);

    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token || !storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
            fetchCollections();
        }
    }, [navigate]);

    // Track default target language preference
    useEffect(() => {
        const storedDefault = localStorage.getItem('translingua_default_target_lang');
        if (storedDefault && storedDefault !== sourceLang) {
            setTargetLang(storedDefault);
        } else {
            setTargetLang(sourceLang === 'vi' ? 'en' : 'vi');
        }
    }, [sourceLang]);

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/dictionary/collections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCollections(response.data || []);
        } catch (err) {
            console.error('Failed to fetch collections', err);
        }
    };

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
        formData.append('source_lang', sourceLang);
        formData.append('target_lang', targetLang);
        formData.append('collection_ids', JSON.stringify(selectedCollections));

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
                setSelectedCollections([]);
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

    const filteredCollections = collections.filter(c => c.source_lang === sourceLang);

    return (
        <div className="app-container">
            <Navbar />

            <main className="main-content">
                <h1 className="dashboard-title">Dictionary Upload</h1>
                <p className="dashboard-desc">Upload your custom vocabulary spreadsheet to import terms directly into your dictionary.</p>

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
                            
                            {/* --- IMPORT SETTINGS PANEL --- */}
                            <div className="upload-settings" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚙️ Import Settings</span>
                                </h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <span className="form-label" style={{ fontSize: '0.75rem' }}>Source Language</span>
                                        <select 
                                            className="form-input" 
                                            value={sourceLang} 
                                            onChange={(e) => {
                                                setSourceLang(e.target.value);
                                                setSelectedCollections([]);
                                            }}
                                            style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#ffffff', outline: 'none' }}
                                        >
                                            {WORLD_LANGUAGES.map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <span className="form-label" style={{ fontSize: '0.75rem' }}>Target Language</span>
                                        <select 
                                            className="form-input" 
                                            value={targetLang} 
                                            onChange={(e) => setTargetLang(e.target.value)}
                                            style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#ffffff', outline: 'none' }}
                                        >
                                            {WORLD_LANGUAGES.filter(lang => lang.code !== sourceLang).map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <span className="form-label" style={{ fontSize: '0.75rem' }}>Add to Collections (Optional)</span>
                                    {filteredCollections.length > 0 ? (
                                        <div className="collections-checklist" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '8px' }}>
                                            {filteredCollections.map(col => (
                                                <label key={col.collection_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedCollections.includes(col.collection_id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedCollections([...selectedCollections, col.collection_id]);
                                                            } else {
                                                                setSelectedCollections(selectedCollections.filter(id => id !== col.collection_id));
                                                            }
                                                        }}
                                                    />
                                                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color_code || '#6366f1' }}></span>
                                                    <span style={{ fontSize: '0.85rem', wordBreak: 'break-word' }} title={col.name}>{col.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                                            No collections available for {WORLD_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang.toUpperCase()}. You can create collections on the Dictionary page.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* --- EXCEL FILE UPLOAD DROPZONE --- */}
                            <div 
                                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                style={{ pointerEvents: uploading ? 'none' : 'auto', marginBottom: '20px' }}
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
                                <span className="file-hint">Supports .xlsx and .xls formats containing matching column headers</span>
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

                    {/* --- EXCEL TEMPLATE GUIDELINES CARD --- */}
                    <div className="stats-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="guidelines-container" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.05rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📋 Spreadsheet Format Guidelines</span>
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                The first row of your spreadsheet must contain column names matching the expected headers. Empty rows or columns are ignored.
                            </p>
                            
                            <div className="table-wrapper" style={{ overflowX: 'auto', marginBottom: '14px' }}>
                                <table className="preview-table" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Expected Header</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Allowed Variations</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><strong>Term</strong></td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace' }}>Term, Original, Word</td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><span style={{ color: 'var(--error)', fontWeight: 600 }}>Required</span></td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><strong>Translation</strong></td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace' }}>Translation, Meaning</td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><span style={{ color: 'var(--error)', fontWeight: 600 }}>Required</span></td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><strong>Pronunciation</strong></td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace' }}>Pronunciation, Pinyin</td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>Optional</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><strong>Category</strong></td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace' }}>Category, POS, Part of Speech</td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>Optional</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><strong>Notes</strong></td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace' }}>Notes, Note</td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>Optional</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                💡 <em>Note:</em> Row data cells under optional headers can be left blank, but cells under <strong>Term</strong> and <strong>Translation</strong> must be fully populated.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#ffffff' }}>Dictionary Statistics</h4>
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
                </div>

                {importedEntries.length > 0 && (
                    <div className="preview-container" style={{ marginTop: '40px' }}>
                        <h3>Imported Entries Preview</h3>
                        <div className="table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Original Term</th>
                                        <th>Translation / Meaning</th>
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
