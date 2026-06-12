import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import {
    Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle, Save, X,
    BookOpen, Folder, FolderPlus, Tag, Trash, ChevronDown, ChevronUp, Layers, Globe, Check
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
    { code: 'or', name: 'Oriya', flag: '🇮🇳' },
    { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'my', name: 'Burmese', flag: '🇲🇲' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'la', name: 'Latin', flag: '🇻🇦' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'cy', name: 'Welsh', flag: '🇬🇧' },
    { code: 'yi', name: 'Yiddish', flag: '🇮🇱' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
    { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
    { code: 'km', name: 'Khmer', flag: '🇰🇭' },
    { code: 'lo', name: 'Lao', flag: '🇱🇦' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
    { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
    { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
    { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
    { code: 'sd', name: 'Sindhi', flag: '🇵🇰' }
];

const langFlag = (code) => {
    return WORLD_LANGUAGES.find(l => l.code === code)?.flag || '🌐';
};

const getLangName = (code) => {
    return WORLD_LANGUAGES.find(l => l.code === code)?.name || code.toUpperCase();
};

export default function DictionaryList() {
    // Dictionary State
    const [terms, setTerms] = useState([]);
    const [term, setTerm] = useState('');
    const [translation, setTranslation] = useState('');
    const [sourceLang, setSourceLang] = useState('zh');
    const [targetLang, setTargetLang] = useState('vi');
    const [pronunciation, setPronunciation] = useState('');
    const [partOfSpeech, setPartOfSpeech] = useState('');
    const [notes, setNotes] = useState('');
    const [examples, setExamples] = useState([{ original_sentence: '', translated_sentence: '' }]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
    const [isDefaultTarget, setIsDefaultTarget] = useState(false);

    // Add-term wizard step (1 = choose language, 2 = fill details)
    const [addStep, setAddStep] = useState(1);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTermId, setExpandedTermId] = useState(null);
    const [checkedTermIds, setCheckedTermIds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editTerm, setEditTerm] = useState('');
    const [editTranslation, setEditTranslation] = useState('');
    const [editSourceLang, setEditSourceLang] = useState('zh');
    const [editTargetLang, setEditTargetLang] = useState('vi');
    const [editPronunciation, setEditPronunciation] = useState('');
    const [editPartOfSpeech, setEditPartOfSpeech] = useState('Noun');
    const [editNotes, setEditNotes] = useState('');
    const [editExamples, setEditExamples] = useState([]);
    const [editCollectionIds, setEditCollectionIds] = useState([]);

    // Languages state (dynamic, from DB)
    const [languages, setLanguages] = useState([]);

    // Collections/Tag States
    const [collections, setCollections] = useState([]);
    const [selectedCollectionFilter, setSelectedCollectionFilter] = useState(null); // null = "All"
    const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('all');
    const [newColName, setNewColName] = useState('');
    const [newColColor, setNewColColor] = useState('#6366f1');
    const [newColLang, setNewColLang] = useState('zh');
    const [showColModal, setShowColModal] = useState(false);

    // Collection rename state
    const [renamingColId, setRenamingColId] = useState(null);
    const [renameVal, setRenameVal] = useState('');

    // General States
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [newlyAddedId, setNewlyAddedId] = useState(null);

    // Common Parts of Speech
    const posOptions = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection', 'Phrase'];

    useEffect(() => {
        fetchTerms();
        fetchCollections();
        fetchLanguages();

        const storedDefault = localStorage.getItem('translingua_default_target_lang');
        if (storedDefault) {
            setIsDefaultTarget(true);
            if (storedDefault !== 'zh') {
                setTargetLang(storedDefault);
            } else {
                setTargetLang('vi');
            }
        }
    }, []);

    // Success and Error Timers
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

    // Client-side Pinyin Auto-recommendation Debounce
    useEffect(() => {
        if (term.trim() && sourceLang === 'zh') {
            const timer = setTimeout(async () => {
                try {
                    const response = await axios.get(`/api/dictionary/pinyin?text=${encodeURIComponent(term)}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setPronunciation(response.data.pinyin);
                } catch (e) {
                    console.error('Pinyin recommendations lookup error', e);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [term, sourceLang]);

    useEffect(() => {
        if (editTerm.trim() && editSourceLang === 'zh') {
            const timer = setTimeout(async () => {
                try {
                    const response = await axios.get(`/api/dictionary/pinyin?text=${encodeURIComponent(editTerm)}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setEditPronunciation(response.data.pinyin);
                } catch (e) {
                    console.error('Edit Pinyin recommendations lookup error', e);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [editTerm, editSourceLang]);

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

    const fetchCollections = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/dictionary/collections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(response.data);
        } catch (err) {
            console.error('Failed to fetch tags/collections');
        }
    };

    const fetchLanguages = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/dictionary/languages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(response.data);
        } catch (err) {
            console.error('Failed to fetch languages');
        }
    };

    // ==========================================
    // DICTIONARY CRUD HANDLERS
    // ==========================================

    const ensureLanguageRegistered = async (code) => {
        const matched = WORLD_LANGUAGES.find(l => l.code === code);
        if (!matched) return;
        if (languages.some(l => l.code === code)) return;
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/dictionary/languages', {
                code: matched.code,
                name: matched.name
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLanguages(prev => {
                if (prev.some(l => l.code === response.data.code)) return prev;
                return [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name));
            });
        } catch (err) {
            console.error('Failed to auto-register language:', err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!term || !translation) return;

        setLoading(true);
        await ensureLanguageRegistered(sourceLang);
        await ensureLanguageRegistered(targetLang);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/dictionary', {
                term,
                translation,
                source_lang: sourceLang,
                target_lang: targetLang,
                pronunciation,
                part_of_speech: partOfSpeech,
                notes,
                collection_ids: selectedCollectionIds,
                examples: examples.filter(ex => ex.original_sentence && ex.translated_sentence)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTerms([response.data, ...terms]);
            setTerm('');
            setTranslation('');
            setPronunciation('');
            setNotes('');
            setPartOfSpeech('');
            setExamples([{ original_sentence: '', translated_sentence: '' }]);
            setSelectedCollectionIds([]);
            setSuccess('Dictionary entry added successfully!');
            setNewlyAddedId(response.data.dict_id);
            // Return wizard to step 1 after success
            setAddStep(1);
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
        setEditSourceLang(entry.source_lang || 'zh');
        setEditTargetLang(entry.target_lang || 'vi');
        setEditPronunciation(entry.pronunciation || '');
        setEditPartOfSpeech(entry.part_of_speech || 'Noun');
        setEditNotes(entry.notes || '');
        setEditExamples(entry.examples || []);
        setEditCollectionIds((entry.collections || []).map(c => c.collection_id));
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (id) => {
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/dictionary/${id}`, {
                term: editTerm,
                translation: editTranslation,
                source_lang: editSourceLang,
                target_lang: editTargetLang,
                pronunciation: editPronunciation,
                part_of_speech: editPartOfSpeech,
                notes: editNotes,
                collection_ids: editCollectionIds,
                examples: editExamples.filter(ex => ex.original_sentence && ex.translated_sentence)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

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

    // ==========================================
    // COLLECTIONS CRUD HANDLERS
    // ==========================================

    const handleAddCollection = async (e) => {
        e.preventDefault();
        if (!newColName) return;
        const token = localStorage.getItem('token');
        try {
            await ensureLanguageRegistered(newColLang);
            const response = await axios.post('/api/dictionary/collections', {
                name: newColName,
                color_code: newColColor,
                source_lang: newColLang
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections([...collections, response.data]);
            setNewColName('');
            setNewColLang(selectedLanguageFilter === 'all' ? 'zh' : selectedLanguageFilter);
            setShowColModal(false);
            setSuccess('Collection created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create collection');
        }
    };

    const handleDeleteCollection = async (colId, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this collection? Dictionary terms in it will not be deleted.')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/dictionary/collections/${colId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(collections.filter(c => c.collection_id !== colId));
            if (selectedCollectionFilter === colId) {
                setSelectedCollectionFilter(null);
            }
            setSuccess('Collection deleted successfully!');
        } catch (err) {
            setError('Failed to delete collection');
        }
    };

    const handleRenameCollection = async (colId) => {
        if (!renameVal.trim()) { setRenamingColId(null); return; }
        const col = collections.find(c => c.collection_id === colId);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/dictionary/collections/${colId}`, {
                name: renameVal.trim(),
                color_code: col?.color_code || '#6366f1'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(collections.map(c => c.collection_id === colId ? response.data : c));
            setRenamingColId(null);
            setSuccess('Collection renamed successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to rename collection');
        }
    };

    // Auto-registration helper handles language insertion dynamically

    // ==========================================
    // BULK OPERATION HANDLERS
    // ==========================================

    const handleBulkDelete = async () => {
        if (checkedTermIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${checkedTermIds.length} selected terms?`)) return;

        const token = localStorage.getItem('token');
        try {
            await axios.post('/api/dictionary/bulk-delete', { ids: checkedTermIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTerms(terms.filter(t => !checkedTermIds.includes(t.dict_id)));
            setCheckedTermIds([]);
            setSuccess('Selected entries deleted successfully!');
        } catch (err) {
            setError('Bulk deletion failed.');
        }
    };

    const handleBulkTag = async (collectionId) => {
        if (checkedTermIds.length === 0 || !collectionId) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post('/api/dictionary/bulk-tag', {
                ids: checkedTermIds,
                collection_id: collectionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refetch to pull aggregated tag lists
            fetchTerms();
            setCheckedTermIds([]);
            setSuccess('Selected entries categorized successfully!');
        } catch (err) {
            setError('Bulk categorization failed.');
        }
    };

    const handleToggleCheckAll = () => {
        if (checkedTermIds.length === filteredTerms.length) {
            setCheckedTermIds([]);
        } else {
            setCheckedTermIds(filteredTerms.map(t => t.dict_id));
        }
    };

    const handleToggleCheckRow = (id) => {
        if (checkedTermIds.includes(id)) {
            setCheckedTermIds(checkedTermIds.filter(x => x !== id));
        } else {
            setCheckedTermIds([...checkedTermIds, id]);
        }
    };

    // ==========================================
    // DYNAMIC INPUT HANDLERS
    // ==========================================

    const handleExampleChange = (index, field, value) => {
        const updated = [...examples];
        updated[index][field] = value;
        setExamples(updated);
    };

    const addExampleRow = () => {
        setExamples([...examples, { original_sentence: '', translated_sentence: '' }]);
    };

    const removeExampleRow = (index) => {
        if (examples.length === 1) {
            setExamples([{ original_sentence: '', translated_sentence: '' }]);
        } else {
            setExamples(examples.filter((_, i) => i !== index));
        }
    };

    const handleEditExampleChange = (index, field, value) => {
        const updated = [...editExamples];
        updated[index][field] = value;
        setEditExamples(updated);
    };

    const addEditExampleRow = () => {
        setEditExamples([...editExamples, { original_sentence: '', translated_sentence: '' }]);
    };

    const removeEditExampleRow = (index) => {
        setEditExamples(editExamples.filter((_, i) => i !== index));
    };

    const handleToggleCollectionSelection = (colId) => {
        if (selectedCollectionIds.includes(colId)) {
            setSelectedCollectionIds(selectedCollectionIds.filter(id => id !== colId));
        } else {
            setSelectedCollectionIds([...selectedCollectionIds, colId]);
        }
    };

    const handleToggleDefaultTarget = (e) => {
        const checked = e.target.checked;
        setIsDefaultTarget(checked);
        if (checked) {
            localStorage.setItem('translingua_default_target_lang', targetLang);
        } else {
            localStorage.removeItem('translingua_default_target_lang');
        }
    };

    const handleToggleEditCollectionSelection = (colId) => {
        if (editCollectionIds.includes(colId)) {
            setEditCollectionIds(editCollectionIds.filter(id => id !== colId));
        } else {
            setEditCollectionIds([...editCollectionIds, colId]);
        }
    };

    const renderCollectionSidebarItem = (col, colCount) => {
        const isActive = selectedCollectionFilter === col.collection_id;
        const isRenaming = renamingColId === col.collection_id;

        if (isRenaming) {
            return (
                <li
                    key={col.collection_id}
                    className="sidebar-folder-item active"
                    onClick={(e) => e.stopPropagation()}
                    style={{ gap: '8px' }}
                >
                    <input
                        type="text"
                        className="form-input edit-inline"
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        maxLength={40}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRenameCollection(col.collection_id);
                            } else if (e.key === 'Escape') {
                                setRenamingColId(null);
                            }
                        }}
                        style={{ height: '28px', fontSize: '0.85rem', padding: '2px 8px', flex: 1 }}
                    />
                    <button
                        className="sidebar-action-btn"
                        onClick={() => handleRenameCollection(col.collection_id)}
                        title="Save"
                        style={{ padding: '2px' }}
                    >
                        <Check size={14} style={{ color: 'var(--success)' }} />
                    </button>
                    <button
                        className="sidebar-action-btn"
                        onClick={() => setRenamingColId(null)}
                        title="Cancel"
                        style={{ padding: '2px' }}
                    >
                        <X size={14} style={{ color: 'var(--error)' }} />
                    </button>
                </li>
            );
        }

        return (
            <li
                key={col.collection_id}
                className={`sidebar-folder-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCollectionFilter(col.collection_id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                    <span
                        className="collection-dot"
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: col.color_code || '#6366f1',
                            display: 'inline-block',
                            flexShrink: 0
                        }}
                    />
                    <span style={{ wordBreak: 'break-word' }} title={col.name}>
                        {col.name}
                    </span>
                </div>
                <div className="sidebar-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="item-count">{colCount}</span>
                    <button
                        className="delete-col-btn edit-col-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRenamingColId(col.collection_id);
                            setRenameVal(col.name);
                        }}
                        title="Rename Collection"
                        style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        className="delete-col-btn"
                        onClick={(e) => handleDeleteCollection(col.collection_id, e)}
                        title="Delete Collection"
                        style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </li>
        );
    };

    // ==========================================
    // SEARCH & FILTERING
    // ==========================================

    const filteredTerms = terms.filter(entry => {
        // Text search match
        const matchesQuery =
            entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.pronunciation || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Language filter match
        const matchesLanguage = selectedLanguageFilter === 'all' ||
            entry.source_lang === selectedLanguageFilter;

        // Collection filter match
        const matchesCollection = selectedCollectionFilter === null ||
            (entry.collections || []).some(c => c.collection_id === selectedCollectionFilter);

        return matchesQuery && matchesLanguage && matchesCollection;
    });

    return (
        <div className="app-container">
            <Navbar />

            {/* Floating Toast Notification Container */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 className="dashboard-title">Personal Dictionary</h1>
                        <p className="dashboard-desc" style={{ marginBottom: 0 }}>Add and classify your custom vocabulary lists. Practice learned terms inside the Study tab.</p>
                    </div>
                    <a href="/flashcards" className="btn btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px' }}>
                        <Layers size={18} />
                        Start Flashcards
                    </a>
                </div>

                {/* Active Language Tabs — dynamic from languages that user actually uses */}
                <div className="language-tabs">
                    <button
                        className={`tab-btn ${selectedLanguageFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedLanguageFilter('all');
                            setSelectedCollectionFilter(null);
                            setAddStep(1);
                        }}
                    >
                        🌍 All Languages
                    </button>
                    {/* Only show tabs for languages the user actually has vocab or collections in */}
                    {languages
                        .filter(lang =>
                            terms.some(t => t.source_lang === lang.code) ||
                            collections.some(c => (c.source_lang || 'zh') === lang.code)
                        )
                        .map(lang => (
                            <button
                                key={lang.code}
                                className={`tab-btn ${selectedLanguageFilter === lang.code ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedLanguageFilter(lang.code);
                                    setSelectedCollectionFilter(null);
                                    setSourceLang(lang.code);
                                    setNewColLang(lang.code);
                                    const storedDefault = localStorage.getItem('translingua_default_target_lang');
                                    if (storedDefault && storedDefault !== lang.code) {
                                        setTargetLang(storedDefault);
                                    } else {
                                        const fallbackTarget = WORLD_LANGUAGES.find(l => l.code !== lang.code)?.code || '';
                                        setTargetLang(fallbackTarget);
                                    }
                                    setSelectedCollectionIds([]);
                                    setPronunciation('');
                                    setTerm('');
                                    setTranslation('');
                                    setAddStep(1);
                                }}
                            >
                                {langFlag(lang.code)} {lang.name} ({lang.code.toUpperCase()})
                            </button>
                        ))
                    }
                </div>

                <div className="dictionary-layout-grid">
                    {/* Left Sidebar: Collections & Folders */}
                    <aside className="dictionary-sidebar">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Folder size={18} style={{ color: 'var(--accent)' }} />
                                Collections
                            </h3>
                            <button
                                className="sidebar-action-btn"
                                onClick={() => {
                                    if (selectedLanguageFilter !== 'all') {
                                        setNewColLang(selectedLanguageFilter);
                                    }
                                    setShowColModal(true);
                                }}
                                title="New Collection"
                            >
                                <FolderPlus size={16} />
                            </button>
                        </div>

                        <ul className="sidebar-folder-list">
                            {/* ---- "All Languages" view: show per-language groups with "All [Lang] Vocabulary" rows ---- */}
                            {selectedLanguageFilter === 'all' ? (
                                (() => {
                                    // Use only languages present in user's data
                                    const activeLangs = languages.filter(ld =>
                                        terms.some(t => t.source_lang === ld.code) ||
                                        collections.some(c => (c.source_lang || 'zh') === ld.code)
                                    );
                                    if (activeLangs.length === 0) {
                                        return (
                                            <li className="sidebar-folder-item" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', justifyContent: 'center' }}>
                                                No vocabulary yet
                                            </li>
                                        );
                                    }
                                    return activeLangs.map(ld => {
                                        const langTermCount = terms.filter(t => t.source_lang === ld.code).length;
                                        const langCols = collections.filter(c => (c.source_lang || 'zh') === ld.code);
                                        return (
                                            <React.Fragment key={ld.code}>
                                                <div className="sidebar-group-header">{langFlag(ld.code)} {ld.name}</div>
                                                {/* "All [Language] Vocabulary" quick-filter row */}
                                                <li
                                                    className="sidebar-folder-item sidebar-lang-all"
                                                    onClick={() => {
                                                        setSelectedLanguageFilter(ld.code);
                                                        setSelectedCollectionFilter(null);
                                                    }}
                                                >
                                                    <span>📖 All {ld.name} Vocabulary</span>
                                                    <span className="item-count">{langTermCount}</span>
                                                </li>
                                                {/* Individual collections for this language, with rename */}
                                                {langCols.map(col => {
                                                    const colCount = terms.filter(t =>
                                                        t.source_lang === ld.code &&
                                                        (t.collections || []).some(c => c.collection_id === col.collection_id)
                                                    ).length;
                                                    return renderCollectionSidebarItem(col, colCount);
                                                })}
                                            </React.Fragment>
                                        );
                                    });
                                })()
                            ) : (
                                /* ---- Single-language view: simple flat list ---- */
                                (() => {
                                    const langObj = languages.find(l => l.code === selectedLanguageFilter);
                                    const langName = langObj?.name || selectedLanguageFilter.toUpperCase();
                                    return (
                                        <>
                                            <li
                                                className={`sidebar-folder-item ${selectedCollectionFilter === null ? 'active' : ''}`}
                                                onClick={() => setSelectedCollectionFilter(null)}
                                            >
                                                <span>📁 All {langName} Vocabulary</span>
                                                <span className="item-count">{terms.filter(t => t.source_lang === selectedLanguageFilter).length}</span>
                                            </li>
                                            {collections
                                                .filter(col => (col.source_lang || 'zh') === selectedLanguageFilter)
                                                .map(col => {
                                                    const colCount = terms.filter(t => (t.collections || []).some(c => c.collection_id === col.collection_id)).length;
                                                    return renderCollectionSidebarItem(col, colCount);
                                                })
                                            }
                                        </>
                                    );
                                })()
                            )}
                        </ul>

                    </aside>

                    {/* Main content split: Input panel & Vocabulary List */}
                    <div className="dictionary-main-panel">
                        {/* Upper Section: Add Term Form — 2-step Wizard */}
                        <div className="upload-card" style={{ marginBottom: '32px' }}>
                            {/* Wizard Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    <Plus size={18} style={{ color: 'var(--accent)' }} />
                                    Add Vocabulary Entry
                                </h3>
                                <div className="wizard-steps-bar">
                                    <div className={`wizard-step-dot ${addStep >= 1 ? 'done' : ''}`}>1</div>
                                    <div className="wizard-step-line"></div>
                                    <div className={`wizard-step-dot ${addStep >= 2 ? 'done' : ''}`}>2</div>
                                </div>
                            </div>

                            {/* ── STEP 1: Choose Languages ── */}
                            {addStep === 1 && (
                                <div className="wizard-panel">
                                    <p className="wizard-hint">Step 1 of 2 — Configure the source and target languages for your new word.</p>

                                    <div className="form-row-grid" style={{ gap: '24px' }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Source Language</label>
                                            <select
                                                className="form-input select-styled"
                                                value={sourceLang}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSourceLang(val);
                                                    if (targetLang === val) {
                                                        const fallback = WORLD_LANGUAGES.find(l => l.code !== val)?.code || '';
                                                        setTargetLang(fallback);
                                                    }
                                                }}
                                                disabled={selectedLanguageFilter !== 'all'}
                                                style={{
                                                    opacity: selectedLanguageFilter !== 'all' ? 0.65 : 1,
                                                    cursor: selectedLanguageFilter !== 'all' ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {WORLD_LANGUAGES.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.flag} {lang.name} ({lang.code.toUpperCase()})
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedLanguageFilter !== 'all' && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                    Locked to active language filter tab.
                                                </span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Translate into (Target Language)</label>
                                            <select
                                                className="form-input select-styled"
                                                value={targetLang}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setTargetLang(val);
                                                    if (isDefaultTarget) {
                                                        localStorage.setItem('translingua_default_target_lang', val);
                                                    }
                                                }}
                                            >
                                                {WORLD_LANGUAGES.filter(lang => lang.code !== sourceLang).map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.flag} {lang.name} ({lang.code.toUpperCase()})
                                                    </option>
                                                ))}
                                            </select>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="default-target-lang-chk"
                                                    checked={isDefaultTarget}
                                                    onChange={handleToggleDefaultTarget}
                                                    style={{ width: 'auto', cursor: 'pointer' }}
                                                />
                                                <label htmlFor="default-target-lang-chk" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', margin: 0 }}>
                                                    Remember as my default target language
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ marginTop: '24px', width: 'auto' }}
                                        onClick={() => setAddStep(2)}
                                    >
                                        Next: Enter Vocabulary →
                                    </button>
                                </div>
                            )}

                            {/* ── STEP 2: Enter Term Details ── */}
                            {addStep === 2 && (
                                <form onSubmit={handleAdd}>
                                    <p className="wizard-hint">
                                        Step 2 of 2 — Adding a <strong style={{ color: 'var(--accent)' }}>
                                            {langFlag(sourceLang)} {WORLD_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang.toUpperCase()}
                                        </strong> word, translated to <strong style={{ color: 'var(--accent)' }}>
                                            {langFlag(targetLang)} {WORLD_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang.toUpperCase()}
                                        </strong>.
                                        <button type="button" onClick={() => setAddStep(1)} className="wizard-back-link">← Change language</button>
                                    </p>

                                    <div className="form-row-grid" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Original Term <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={
                                                    sourceLang === 'zh' ? 'e.g. 谢谢' :
                                                        sourceLang === 'en' ? 'e.g. hello' :
                                                            sourceLang === 'vi' ? 'e.g. xin chào' :
                                                                'Enter term...'
                                                }
                                                value={term}
                                                onChange={(e) => setTerm(e.target.value)}
                                                style={{ paddingLeft: '16px' }}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pronunciation{sourceLang === 'zh' ? ' / Pinyin' : ''}</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={sourceLang === 'zh' ? 'e.g. xièxie (auto-suggested)' : 'Optional'}
                                                value={pronunciation}
                                                onChange={(e) => setPronunciation(e.target.value)}
                                                style={{ paddingLeft: '16px' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row-grid" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Meaning / Translation <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={
                                                    targetLang === 'vi' ? 'e.g. cảm ơn' :
                                                        targetLang === 'en' ? 'e.g. thank you' :
                                                            targetLang === 'zh' ? 'e.g. 谢谢' :
                                                                'Enter translation...'
                                                }
                                                value={translation}
                                                onChange={(e) => setTranslation(e.target.value)}
                                                style={{ paddingLeft: '16px' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Part of Speech</label>
                                            <select className="form-input select-styled" value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)}>
                                                <option value="">Choose category...</option>
                                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="form-label">Custom Notes</label>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notes.length}/500</span>
                                        </div>
                                        <textarea
                                            className="form-input text-area-styled"
                                            placeholder="Add usage rules, synonyms, or translation context notes..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            maxLength={500}
                                        />
                                    </div>

                                    {/* Collections filtered by chosen source language */}
                                    {(() => {
                                        const matchingCols = collections.filter(col => (col.source_lang || 'zh') === sourceLang);
                                        if (matchingCols.length === 0) return (
                                            <div className="form-group" style={{ marginTop: '16px' }}>
                                                <label className="form-label">Assign to Collections</label>
                                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    No collections for {WORLD_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang.toUpperCase()} yet.
                                                    <button type="button" className="wizard-back-link" style={{ marginLeft: '8px' }} onClick={() => { setNewColLang(sourceLang); setShowColModal(true); }}>+ Create one</button>
                                                </p>
                                            </div>
                                        );
                                        return (
                                            <div className="form-group" style={{ marginTop: '16px' }}>
                                                <label className="form-label">Assign to Collections <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                                    {matchingCols.map(col => {
                                                        const selected = selectedCollectionIds.includes(col.collection_id);
                                                        return (
                                                            <button
                                                                key={col.collection_id}
                                                                type="button"
                                                                className={`badge-toggle-btn ${selected ? 'active' : ''}`}
                                                                style={{ '--col-color': col.color_code }}
                                                                onClick={() => handleToggleCollectionSelection(col.collection_id)}
                                                            >
                                                                {col.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Custom Example Sentences */}
                                    <div className="form-group" style={{ marginTop: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="form-label" style={{ marginBottom: 0 }}>Context Example Sentences</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    ({examples.length}/5 sentences, max 200 chars each)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={addExampleRow}
                                                disabled={examples.length >= 5}
                                                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem', opacity: examples.length >= 5 ? 0.5 : 1, cursor: examples.length >= 5 ? 'not-allowed' : 'pointer' }}
                                            >
                                                + Add Sentence
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                                            {examples.map((ex, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Original Sentence"
                                                        value={ex.original_sentence}
                                                        onChange={(e) => handleExampleChange(idx, 'original_sentence', e.target.value)}
                                                        style={{ paddingLeft: '12px', flex: 1 }}
                                                        maxLength={200}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Translation"
                                                        value={ex.translated_sentence}
                                                        onChange={(e) => handleExampleChange(idx, 'translated_sentence', e.target.value)}
                                                        style={{ paddingLeft: '12px', flex: 1 }}
                                                        maxLength={200}
                                                    />
                                                    <button type="button" className="delete-col-btn" onClick={() => removeExampleRow(idx)} style={{ padding: '8px' }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setAddStep(1)}>
                                            ← Back
                                        </button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                            <Plus size={18} />
                                            {loading ? 'Adding...' : 'Add Term'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Lower Section: Dictionary Table Listing */}
                        <div className="preview-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                                    <h3 style={{ margin: 0 }}>
                                        {selectedLanguageFilter === 'all' ? 'Global Dictionary Listing' : `${getLangName(selectedLanguageFilter)} Dictionary Listing`}
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="form-input-wrapper" style={{ width: '220px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Search term or pronunciation..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
                                        />
                                        <Search className="form-input-icon" size={14} style={{ left: '12px' }} />
                                    </div>
                                    <div className="user-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', border: '1px solid var(--border-glow)' }}>
                                        Total: {filteredTerms.length} {filteredTerms.length === 1 ? 'word' : 'words'}
                                    </div>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '5%', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={filteredTerms.length > 0 && checkedTermIds.length === filteredTerms.length}
                                                    onChange={handleToggleCheckAll}
                                                />
                                            </th>
                                            <th style={{ width: '6%' }}>#</th>
                                            <th style={{ width: '25%' }}>Term</th>
                                            <th style={{ width: '20%' }}>Pronunciation</th>
                                            <th style={{ width: '24%' }}>Translation</th>
                                            <th style={{ width: '10%', textAlign: 'center' }}>Details</th>
                                            <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTerms.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No vocabulary terms found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTerms.map((entry, idx) => {
                                                const isNew = entry.dict_id === newlyAddedId;
                                                const isExpanded = expandedTermId === entry.dict_id;
                                                const isChecked = checkedTermIds.includes(entry.dict_id);

                                                return (
                                                    <React.Fragment key={entry.dict_id}>
                                                        <tr className={`${isNew ? "row-highlight-new" : ""} ${isChecked ? "row-checked" : ""}`}>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleCheckRow(entry.dict_id)}
                                                                />
                                                            </td>
                                                            <td style={{ fontWeight: '600', color: isNew ? 'var(--success)' : 'var(--text-muted)' }}>{idx + 1}</td>

                                                            {editingId === entry.dict_id ? (
                                                                // Edit inline fields
                                                                <>
                                                                    <td colSpan="3">
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
                                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                                <input type="text" className="form-input edit-inline" value={editTerm} onChange={(e) => setEditTerm(e.target.value)} placeholder="Term" />
                                                                                <input type="text" className="form-input edit-inline" value={editPronunciation} onChange={(e) => setEditPronunciation(e.target.value)} placeholder="Pronunciation" />
                                                                                <input type="text" className="form-input edit-inline" value={editTranslation} onChange={(e) => setEditTranslation(e.target.value)} placeholder="Translation" />
                                                                            </div>
                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                                <select className="form-input select-styled edit-inline" value={editPartOfSpeech} onChange={(e) => setEditPartOfSpeech(e.target.value)}>
                                                                                    {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                                </select>
                                                                                <input type="text" className="form-input edit-inline" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Custom usage notes..." maxLength={500} />
                                                                            </div>
                                                                            {/* Collections picker in edit inline */}
                                                                            {(() => {
                                                                                const matchingEditCols = collections.filter(col => (col.source_lang || 'zh') === editSourceLang);
                                                                                if (matchingEditCols.length === 0) {
                                                                                    return <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>No collections for this language.</div>;
                                                                                }
                                                                                return (
                                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                                                                        {matchingEditCols.map(col => {
                                                                                            const colSelected = editCollectionIds.includes(col.collection_id);
                                                                                            return (
                                                                                                <button
                                                                                                    key={col.collection_id}
                                                                                                    type="button"
                                                                                                    className={`badge-toggle-btn ${colSelected ? 'active' : ''}`}
                                                                                                    style={{ '--col-color': col.color_code, padding: '2px 8px', fontSize: '0.75rem' }}
                                                                                                    onClick={() => handleToggleEditCollectionSelection(col.collection_id)}
                                                                                                >
                                                                                                    {col.name}
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                            {/* Examples editor inside edit inline */}
                                                                            <div style={{ marginTop: '8px' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                                                    <span>Edit Example Sentences {editExamples.length >= 5 ? <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>(Max 5)</span> : ''}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-secondary"
                                                                                        onClick={addEditExampleRow}
                                                                                        disabled={editExamples.length >= 5}
                                                                                        style={{ width: 'auto', padding: '2px 8px', fontSize: '0.75rem', opacity: editExamples.length >= 5 ? 0.5 : 1, cursor: editExamples.length >= 5 ? 'not-allowed' : 'pointer' }}
                                                                                    >
                                                                                        + Add
                                                                                    </button>
                                                                                </div>
                                                                                {editExamples.map((ex, eIdx) => (
                                                                                    <div key={eIdx} style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                                                                                        <input type="text" className="form-input edit-inline" placeholder="Original sentence" value={ex.original_sentence} onChange={(e) => handleEditExampleChange(eIdx, 'original_sentence', e.target.value)} maxLength={200} style={{ flex: 1 }} />
                                                                                        <input type="text" className="form-input edit-inline" placeholder="Translation" value={ex.translated_sentence} onChange={(e) => handleEditExampleChange(eIdx, 'translated_sentence', e.target.value)} maxLength={200} style={{ flex: 1 }} />
                                                                                        <button type="button" className="delete-col-btn" onClick={() => removeEditExampleRow(eIdx)}><X size={14} /></button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {/* No expand details trigger on edit */}
                                                                    </td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                                            <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px', color: 'var(--success)' }} onClick={() => handleSaveEdit(entry.dict_id)} title="Save changes">
                                                                                <Save size={14} />
                                                                            </button>
                                                                            <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px', color: 'var(--error)' }} onClick={handleCancelEdit} title="Cancel">
                                                                                <X size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                // Static list cells
                                                                <>
                                                                    <td style={{ color: isNew ? 'var(--success)' : 'inherit', fontWeight: isNew ? '600' : 'normal' }}>
                                                                        {entry.term}
                                                                        {/* Render collection pills */}
                                                                        {Array.isArray(entry.collections) && entry.collections.length > 0 && (
                                                                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                                {entry.collections.map(c => (
                                                                                    <span
                                                                                        key={c.collection_id}
                                                                                        className="collection-pill"
                                                                                        style={{ backgroundColor: c.color_code }}
                                                                                    >
                                                                                        {c.name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ color: 'var(--text-secondary)' }}>{entry.pronunciation || '-'}</td>
                                                                    <td>{entry.translation}</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            style={{ width: 'auto', padding: '6px', borderColor: 'transparent' }}
                                                                            onClick={() => setExpandedTermId(isExpanded ? null : entry.dict_id)}
                                                                        >
                                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                        </button>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                            <button className="btn btn-secondary animate-pulse" style={{ width: 'auto', padding: '6px', borderColor: 'transparent' }} onClick={() => handleStartEdit(entry)} title="Edit term">
                                                                                <Edit2 size={14} />
                                                                            </button>
                                                                            <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px', borderColor: 'transparent', color: 'var(--error)' }} onClick={() => handleDelete(entry.dict_id)} title="Delete term">
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>

                                                        {/* Collapsible Details Row */}
                                                        {isExpanded && !editingId && (
                                                            <tr className="expanded-details-row">
                                                                <td colSpan="7" style={{ backgroundColor: 'rgba(255, 255, 255, 0.015)' }}>
                                                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                        <div style={{ display: 'flex', gap: '40px' }}>
                                                                            {entry.part_of_speech && (
                                                                                <div>
                                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Part of Speech</span>
                                                                                    <div style={{ color: 'var(--text-primary)', marginTop: '4px', fontSize: '0.9rem' }}>{entry.part_of_speech}</div>
                                                                                </div>
                                                                            )}
                                                                            {entry.box_level !== undefined && (
                                                                                <div>
                                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Leitner Box Level</span>
                                                                                    <div style={{ color: 'var(--text-primary)', marginTop: '4px', fontSize: '0.9rem' }}>Box {entry.box_level} / 5</div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {entry.notes && (
                                                                            <div>
                                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Usage & Translation Notes</span>
                                                                                <p style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                                                    {entry.notes}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {Array.isArray(entry.examples) && entry.examples.length > 0 && (
                                                                            <div>
                                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Bilingual Sentences Context</span>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                    {entry.examples.map((ex, eIdx) => (
                                                                                        <div key={ex.example_id || eIdx} style={{ fontSize: '0.85rem', borderLeft: '2px solid var(--accent)', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                                            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ex.original_sentence}</div>
                                                                                            <div style={{ color: 'var(--text-muted)' }}>{ex.translated_sentence}</div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Bulk Action Bar (when rows are selected) */}
            {checkedTermIds.length > 0 && (
                <div className="bulk-actions-floating-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                            {checkedTermIds.length} items selected
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary bulk-btn" onClick={handleBulkDelete} style={{ color: 'var(--error)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                                <Trash size={16} />
                                Delete
                            </button>

                            {collections.length > 0 && (() => {
                                const checkedTerms = terms.filter(t => checkedTermIds.includes(t.dict_id));
                                const checkedLanguages = [...new Set(checkedTerms.map(t => t.source_lang || 'zh'))];
                                const isMixed = checkedLanguages.length > 1;
                                const singleLang = checkedLanguages.length === 1 ? checkedLanguages[0] : null;
                                const matchingCollections = singleLang
                                    ? collections.filter(c => (c.source_lang || 'zh') === singleLang)
                                    : [];

                                return (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <select
                                            className="form-input select-styled bulk-btn"
                                            value=""
                                            disabled={isMixed}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleBulkTag(parseInt(e.target.value, 10));
                                                }
                                            }}
                                            style={{ width: '200px', paddingRight: '28px', height: '38px', fontSize: '0.85rem' }}
                                        >
                                            {isMixed ? (
                                                <option value="" disabled>❌ Mixed languages selected</option>
                                            ) : matchingCollections.length === 0 ? (
                                                <option value="" disabled>📁 No matching tags</option>
                                            ) : (
                                                <>
                                                    <option value="" disabled>📁 Add to tag...</option>
                                                    {matchingCollections.map(c => (
                                                        <option key={c.collection_id} value={c.collection_id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                    <button className="delete-col-btn" onClick={() => setCheckedTermIds([])} title="Deselect All">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Collection Creation Modal */}
            {showColModal && (
                <div className="custom-modal-backdrop" onClick={() => setShowColModal(false)}>
                    <div className="custom-modal-body upload-card" style={{ maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Create Tag / Folder</h3>
                            <button className="delete-col-btn" onClick={() => setShowColModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCollection}>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label">Collection Name</label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{newColName.length}/40</span>
                                </div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Vocabulary HSK 4"
                                    value={newColName}
                                    onChange={(e) => setNewColName(e.target.value)}
                                    style={{ paddingLeft: '12px' }}
                                    maxLength={40}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">Source Language</label>
                                <select
                                    className="form-input select-styled"
                                    value={newColLang}
                                    onChange={(e) => setNewColLang(e.target.value)}
                                    disabled={selectedLanguageFilter !== 'all'}
                                    style={{
                                        opacity: selectedLanguageFilter !== 'all' ? 0.65 : 1,
                                        cursor: selectedLanguageFilter !== 'all' ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {WORLD_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name} ({lang.code.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                                {selectedLanguageFilter !== 'all' && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                        Locked to active language filter tab.
                                    </span>
                                )}
                            </div>
                            <div className="form-group" style={{ marginTop: '16px', marginBottom: '24px' }}>
                                <label className="form-label">Tag Badge Color</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        className="color-picker-styled"
                                        value={newColColor}
                                        onChange={(e) => setNewColColor(e.target.value)}
                                    />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{newColColor}</span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                <Plus size={16} />
                                Create Collection
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Language Addition Modal removed since auto-registration handles it */}

            <style>{`
                /* Language Tabs styling */
                .language-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 12px;
                    flex-wrap: wrap;
                }
                .tab-btn {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-secondary);
                    padding: 8px 16px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .tab-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                }
                .tab-btn.active {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: var(--accent);
                    color: var(--accent);
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
                }
                .sidebar-group-header {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-top: 16px;
                    margin-bottom: 4px;
                    padding-left: 8px;
                    letter-spacing: 0.05em;
                }
                .sidebar-lang-all {
                    font-style: italic;
                    font-size: 0.85rem !important;
                }

                /* ── Wizard Styles ── */
                .wizard-steps-bar {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .wizard-step-dot {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--transition);
                }
                .wizard-step-dot.done {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .wizard-step-line {
                    width: 28px;
                    height: 1px;
                    background: var(--border);
                }
                .wizard-hint {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .wizard-back-link {
                    background: none;
                    border: none;
                    color: var(--accent);
                    cursor: pointer;
                    font-size: 0.82rem;
                    padding: 0;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .wizard-panel {
                    animation: fadeIn 0.2s ease-out;
                }
                .lang-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 12px;
                }
                .lang-card-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 20px 12px;
                    border-radius: var(--radius-md);
                    border: 1.5px solid var(--border);
                    background: rgba(255,255,255,0.02);
                    cursor: pointer;
                    transition: var(--transition);
                    color: var(--text-secondary);
                }
                .lang-card-btn:hover {
                    border-color: var(--accent);
                    background: rgba(99, 102, 241, 0.06);
                    color: var(--text-primary);
                }
                .lang-card-btn.selected {
                    border-color: var(--accent);
                    background: rgba(99, 102, 241, 0.12);
                    color: var(--accent);
                    box-shadow: 0 0 14px rgba(99, 102, 241, 0.25);
                }
                .lang-card-flag {
                    font-size: 2rem;
                }
                .lang-card-name {
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                .lang-card-sub {
                    font-size: 0.72rem;
                    opacity: 0.6;
                }

                /* Grid Layout */
                .dictionary-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                }
                @media (min-width: 992px) {
                    .dictionary-layout-grid {
                        grid-template-columns: 240px 1fr;
                    }
                }

                /* Sidebar folders list */
                .dictionary-sidebar {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    height: fit-content;
                }
                .sidebar-action-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                }
                .sidebar-action-btn:hover {
                    color: var(--accent);
                    background: rgba(255, 255, 255, 0.05);
                }
                .sidebar-folder-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .sidebar-folder-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    transition: var(--transition);
                }
                .sidebar-folder-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: #ffffff;
                }
                .sidebar-folder-item.active {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--accent);
                    font-weight: 600;
                    border-left: 3px solid var(--accent);
                    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
                }
                .item-count {
                    font-size: 0.75rem;
                    background: rgba(255,255,255,0.05);
                    padding: 2px 6px;
                    border-radius: 10px;
                    color: var(--text-muted);
                }
                .sidebar-folder-item.active .item-count {
                    background: rgba(99, 102, 241, 0.2);
                    color: var(--accent);
                }
                .delete-col-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 2px;
                    opacity: 0;
                    transition: var(--transition);
                }
                .sidebar-folder-item:hover .delete-col-btn {
                    opacity: 1;
                }
                .delete-col-btn:hover {
                    color: var(--error);
                }

                /* Form Layout Styling */
                .form-row-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                @media (min-width: 576px) {
                    .form-row-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .select-styled {
                    appearance: none;
                    -webkit-appearance: none;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                    padding-right: 36px !important;
                }
                .text-area-styled {
                    min-height: 80px;
                    resize: vertical;
                    padding-top: 12px !important;
                    line-height: 1.5;
                }

                /* Badge Tag Toggle Button */
                .badge-toggle-btn {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    padding: 6px 12px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .badge-toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--text-muted);
                }
                .badge-toggle-btn.active {
                    background: var(--col-color, var(--accent));
                    color: #ffffff;
                    border-color: transparent;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
                }

                /* Tag pills in table */
                .collection-pill {
                    font-size: 0.75rem;
                    color: #ffffff;
                    padding: 2px 8px;
                    border-radius: 10px;
                    display: inline-block;
                    font-weight: 500;
                }

                /* Floating Bulk Bar */
                .bulk-actions-floating-bar {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(17, 19, 28, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--border-focus);
                    border-radius: var(--radius-lg);
                    padding: 12px 24px;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                :root[data-theme="light"] .bulk-actions-floating-bar {
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
                }
                :root[data-theme="light"] .sidebar-folder-item:hover {
                    background: rgba(0, 0, 0, 0.03);
                    color: var(--text-primary);
                }
                :root[data-theme="light"] .item-count {
                    background: rgba(0, 0, 0, 0.05);
                    color: var(--text-muted);
                }
                :root[data-theme="light"] .badge-toggle-btn {
                    background: rgba(0, 0, 0, 0.02);
                }
                :root[data-theme="light"] .badge-toggle-btn:hover {
                    background: rgba(0, 0, 0, 0.05);
                }
                @keyframes slideUp {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .bulk-btn {
                    width: auto !important;
                    height: 38px !important;
                    padding: 0 16px !important;
                    font-size: 0.85rem !important;
                }

                /* Modal styling */
                .custom-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.2s ease-out;
                }
                .custom-modal-body {
                    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .color-picker-styled {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    background: none;
                    padding: 0;
                    overflow: hidden;
                }
                .color-picker-styled::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                .color-picker-styled::-webkit-color-swatch {
                    border: none;
                    border-radius: 50%;
                }

                /* Active inline overrides */
                .edit-inline {
                    padding: 8px 12px !important;
                    font-size: 0.85rem !important;
                    height: 36px !important;
                }
                
                .row-checked {
                    background: rgba(99, 102, 241, 0.02) !important;
                }
            `}</style>
        </div>
    );
}
