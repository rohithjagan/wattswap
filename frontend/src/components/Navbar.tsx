
import { Link, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, LogIn, UserPlus, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const navLinkStyle = (path: string) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        transition: 'color 0.2s',
    });

    return (
        <nav style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1rem'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={32} color="var(--color-primary)" />
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Watt-Swap</span>
                    </Link>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                        <LayoutDashboard size={16} />
                        Dashboard
                    </Link>
                    <Link to="/trading" style={navLinkStyle('/trading')}>
                        <TrendingUp size={16} />
                        Trading
                    </Link>
                    {user ? (
                        <button onClick={logout} style={{ ...navLinkStyle('#'), border: 'none', cursor: 'pointer' }}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" style={navLinkStyle('/login')}>
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link to="/register" style={navLinkStyle('/register')}>
                                <UserPlus size={16} />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
