import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import {
    Check, X, RefreshCw, Award, BookOpen, AlertCircle, Eye, ChevronRight
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

export default function Flashcards() {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionCount, setSessionCount] = useState(0);

    const [collections, setCollections] = useState([]);
    const [practiceMode, setPracticeMode] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedCollectionId, setSelectedCollectionId] = useState('all');
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        fetchCollections();
        fetchLanguages();
    }, []);

    const fetchCollections = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/dictionary/collections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(response.data);
        } catch (err) {
            console.error('Failed to fetch tags/collections', err);
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
            console.error('Failed to fetch languages', err);
        }
    };

    const fetchReviewQueue = async (lang = selectedLanguage, colId = selectedCollectionId) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/api/dictionary/review?source_lang=${lang}&collection_id=${colId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQueue(response.data);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (err) {
            setError('Failed to fetch review flashcards.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (correct) => {
        if (queue.length === 0) return;
        const currentCard = queue[currentIndex];
        const token = localStorage.getItem('token');

        try {
            await axios.post(`/api/dictionary/review/${currentCard.dict_id}`,
                { correct },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Advance state
            setSessionCount(prev => prev + 1);
            setIsFlipped(false);

            setTimeout(() => {
                if (currentIndex + 1 < queue.length) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    // Review queue completed! Refetch in case new due items are available
                    fetchReviewQueue(selectedLanguage, selectedCollectionId);
                }
            }, 200);
        } catch (err) {
            alert('Failed to save flashcard review response.');
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <Navbar />
                <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--accent)' }} />
                </main>
            </div>
        );
    }

    const hasCards = queue.length > 0 && currentIndex < queue.length;
    const currentCard = hasCards ? queue[currentIndex] : null;

    return (
        <div className="app-container">
            <Navbar />

            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 className="dashboard-title">Flashcard Practice</h1>
                        <p className="dashboard-desc" style={{ marginBottom: 0 }}>Review terms using Box-based Spaced Repetition (Leitner System).</p>
                    </div>
                    {practiceMode && hasCards && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setPracticeMode(false)} style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', height: '36px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                ⬅ Settings
                            </button>
                            <div className="user-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', border: '1px solid var(--border-glow)' }}>
                                Card {currentIndex + 1} of {queue.length}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
                        <AlertCircle size={18} />
                        <div>{error}</div>
                    </div>
                )}

                {!practiceMode ? (
                    <div className="upload-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '32px' }}>
                        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                            Configure Practice Session
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Choose a vocabulary focus for your spaced repetition review.
                        </p>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Language Focus</label>
                            <select
                                className="form-input select-styled"
                                value={selectedLanguage}
                                onChange={(e) => {
                                    setSelectedLanguage(e.target.value);
                                    setSelectedCollectionId('all');
                                }}
                            >
                                <option value="all">🌍 All Languages</option>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {langFlag(lang.code)} {lang.name} ({lang.code.toUpperCase()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Collection / Folder</label>
                            <select
                                className="form-input select-styled"
                                value={selectedCollectionId}
                                onChange={(e) => setSelectedCollectionId(e.target.value)}
                            >
                                <option value="all">📁 All Collections</option>
                                {collections
                                    .filter(col => selectedLanguage === 'all' || (col.source_lang || 'zh') === selectedLanguage)
                                    .map(col => (
                                        <option key={col.collection_id} value={col.collection_id}>
                                            🏷️ {col.name} ({col.source_lang ? col.source_lang.toUpperCase() : 'ZH'})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={async () => {
                                await fetchReviewQueue(selectedLanguage, selectedCollectionId);
                                setPracticeMode(true);
                            }}
                        >
                            Start Practice Session
                        </button>
                    </div>
                ) : !hasCards ? (
                    <div className="upload-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
                        <Award size={64} style={{ color: 'var(--success)', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} />
                        <h2 style={{ marginBottom: '12px' }}>All Caught Up!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                            You have no pending reviews left in your boxes today for this selection. New review cards will appear as schedule intervals lapse.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => fetchReviewQueue(selectedLanguage, selectedCollectionId)} style={{ width: 'auto' }}>
                                <RefreshCw size={16} />
                                Refresh Queue
                            </button>
                            <button className="btn btn-secondary" onClick={() => setPracticeMode(false)} style={{ width: 'auto' }}>
                                <RefreshCw size={16} />
                                Change Scope / Settings
                            </button>
                            <a href="/dictionary" className="btn btn-secondary" style={{ width: 'auto' }}>
                                <BookOpen size={16} />
                                View Dictionary
                            </a>
                        </div>
                        {sessionCount > 0 && (
                            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                You reviewed <strong>{sessionCount}</strong> terms in this session. Great job!
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="study-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {/* Box Level Progress Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                Box Level: {currentCard.box_level} / 5
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Lang: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentCard.source_lang} ➔ {currentCard.target_lang}</span>
                            </span>
                        </div>

                        {/* 3D Flipping Flashcard Wrapper */}
                        <div
                            className={`flashcard-card ${isFlipped ? 'flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="flashcard-inner">
                                {/* Card Front (Term) */}
                                <div className="flashcard-face flashcard-front">
                                    <div className="face-content">
                                        <span className="card-hint">Click card to reveal translation</span>
                                        <h2 className="term-display">{currentCard.term}</h2>
                                        <div className="reveal-badge">
                                            <Eye size={16} />
                                            <span>Reveal</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Back (Translation, Details, Examples) */}
                                <div className="flashcard-face flashcard-back">
                                    <div className="face-content" style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '32px' }}>
                                        {/* Header details */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentCard.term}</span>
                                            {currentCard.part_of_speech && (
                                                <span className="user-badge" style={{ fontSize: '0.75rem', height: 'fit-content' }}>
                                                    {currentCard.part_of_speech}
                                                </span>
                                            )}
                                        </div>

                                        {/* Pronunciation & Meaning */}
                                        {currentCard.pronunciation && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Pronunciation / Pinyin</label>
                                                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{currentCard.pronunciation}</div>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '16px' }}>
                                            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Vietnamese Meaning</label>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>{currentCard.translation}</div>
                                        </div>

                                        {/* Custom Notes */}
                                        {currentCard.notes && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Notes</label>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                    {currentCard.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Example Sentences */}
                                        {Array.isArray(currentCard.examples) && currentCard.examples.length > 0 && (
                                            <div>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Examples</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {currentCard.examples.map((ex, i) => (
                                                        <div key={ex.example_id || i} style={{ fontSize: '0.85rem', borderLeft: '2px solid var(--border)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div style={{ color: 'var(--text-primary)' }}>{ex.original_sentence}</div>
                                                            <div style={{ color: 'var(--text-muted)' }}>{ex.translated_sentence}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Answer Action Buttons */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button
                                className="btn btn-secondary review-action-btn action-incorrect"
                                onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
                            >
                                <X size={20} />
                                Forgot
                            </button>
                            <button
                                className="btn btn-primary review-action-btn action-correct"
                                onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
                            >
                                <Check size={20} />
                                Remembered
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                /* 3D Flashcard styles */
                .flashcard-card {
                    height: 380px;
                    perspective: 1000px;
                    cursor: pointer;
                }
                .flashcard-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }
                .flashcard-card.flipped .flashcard-inner {
                    transform: rotateY(180deg);
                }
                .flashcard-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    background: var(--bg-card);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
                }
                .flashcard-front {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .flashcard-back {
                    transform: rotateY(180deg);
                    overflow-y: auto;
                }
                .face-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .card-hint {
                    position: absolute;
                    top: 24px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .term-display {
                    font-size: 3.5rem;
                    font-weight: 800;
                    background: var(--accent-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .reveal-badge {
                    position: absolute;
                    bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    transition: var(--transition);
                }
                .flashcard-card:hover .reveal-badge {
                    background: var(--accent);
                    color: #ffffff;
                    box-shadow: 0 0 15px var(--accent-glow);
                    transform: translateY(-2px);
                }
                .review-action-btn {
                    height: 56px;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .action-incorrect {
                    border-color: rgba(244, 63, 94, 0.4);
                    color: var(--error);
                }
                .action-incorrect:hover {
                    background: rgba(244, 63, 94, 0.08);
                    border-color: var(--error);
                }
                .action-correct:hover {
                    background: var(--success);
                    border-color: var(--success);
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
                }
            `}</style>
        </div>
    );
}
