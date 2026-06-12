import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [resetLink, setResetLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setResetLink('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            const msg = response.data.message || 'If an account exists, a link has been generated.';
            setSuccess(msg);
            // Extract the actual URL from the message if present
            const urlMatch = msg.match(/https?:\/\/\S+/);
            if (urlMatch) setResetLink(urlMatch[0]);
        } catch (err) {
            setError(err.response?.data?.message || 'Request failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">TransLingua</div>
                    <div className="auth-subtitle">Reset your account password</div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <div>{error}</div>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                        <div>
                            {resetLink 
                                ? 'Password reset link generated! Click the button below to reset your password.' 
                                : success}
                        </div>
                    </div>
                )}

                {resetLink && (
                    <a href={resetLink} className="btn btn-primary" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                        <KeyRound size={18} />
                        Click Here to Reset Password
                    </a>
                )}


                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Email Address</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail className="form-input-icon" size={18} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending link...' : (
                                <>
                                    <KeyRound size={18} />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Back to Login
                    </Link>
                )}

                {!success && (
                    <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={16} /> <Link to="/login">Back to login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
