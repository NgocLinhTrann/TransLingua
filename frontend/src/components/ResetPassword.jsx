import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, AlertCircle, CheckCircle2, Save } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!token) {
            return setError('Reset token is missing.');
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/reset-password', { token, newPassword });
            setSuccess(response.data.message || 'Password reset successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed. The token may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">TransLingua</div>
                    <div className="auth-subtitle">Create a new password</div>
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
                        <div>{success}</div>
                    </div>
                )}

                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Lock className="form-input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Confirm New Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Lock className="form-input-icon" size={18} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating password...' : (
                                <>
                                    <Save size={18} />
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
}
