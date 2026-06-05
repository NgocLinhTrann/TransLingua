import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, LogIn } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;

        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing.');
                return;
            }
            try {
                const response = await axios.get(`/api/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Email verification failed. The token may be invalid or expired.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-header">
                    <div className="auth-logo">TransLingua</div>
                    <div className="auth-subtitle">Account Verification</div>
                </div>

                {status === 'loading' && (
                    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div className="loading-spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid rgba(255, 255, 255, 0.1)',
                            borderTop: '4px solid var(--accent)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p>Verifying your email address, please wait...</p>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div className="alert alert-success" style={{ width: '100%', textAlign: 'left' }}>
                            <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
                            <div>{message}</div>
                        </div>
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            <LogIn size={18} />
                            Proceed to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div className="alert alert-error" style={{ width: '100%', textAlign: 'left' }}>
                            <XCircle size={24} style={{ flexShrink: 0 }} />
                            <div>{message}</div>
                        </div>
                        <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
