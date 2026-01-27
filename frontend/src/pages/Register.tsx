import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', { name, email, password });
            login(res.data.token, res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <Layout>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Zap size={48} color="var(--color-primary)" />
                    </div>
                    <h2 className="text-center mb-lg" style={{ fontSize: '1.5rem' }}>Create your account</h2>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full">
                            Sign Up
                        </button>
                    </form>

                    <div className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
