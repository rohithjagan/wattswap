import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Sun, Battery, ArrowUpRight, Wallet, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const { meterData, isConnected } = useSocket();
    const [prediction, setPrediction] = useState<any>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading || !user) return; // Wait for auth or don't fetch if not logged in

        const fetchPrediction = async () => {
            try {
                setAiError(null);
                const res = await api.get('/dashboard/summary');
                setPrediction(res.data);
            } catch (err: any) {
                console.error('Failed to fetch AI prediction', err);
                setAiError(err.response?.data?.message || err.message || 'Failed to load forecast');
            }
        };
        fetchPrediction();
    }, [user]);

    const cardStyle = {
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    };

    const valueContainerStyle = {
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.5rem',
    };

    const valueStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
    };

    const generation = meterData?.generation.toFixed(2) || '0.00';
    const consumption = meterData?.consumption.toFixed(2) || '0.00';
    const surplus = meterData?.surplus.toFixed(2) || '0.00';
    const isSurplusPositive = (meterData?.surplus || 0) >= 0;

    if (isLoading) {
        return <Layout><div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>Loading account...</div></Layout>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Energy Dashboard</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back, {user?.name || 'User'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--color-border)' }}>
                    <Activity size={16} color={isConnected ? 'var(--color-success)' : 'var(--color-danger)'} />
                    <span style={{ fontSize: '0.875rem', color: isConnected ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {isConnected ? 'System Live' : 'Connecting...'}
                    </span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Solar Generation Card */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Solar Generation</h3>
                        <Sun color="var(--color-primary)" size={24} />
                    </div>
                    <div style={valueContainerStyle}>
                        <span style={valueStyle}>{generation} kWh</span>
                    </div>
                </div>

                {/* Consumption Card */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Consumption</h3>
                        <Battery color="var(--color-secondary)" size={24} />
                    </div>
                    <div style={valueContainerStyle}>
                        <span style={valueStyle}>{consumption} kWh</span>
                    </div>
                </div>

                {/* Net Surplus Card */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Net Surplus</h3>
                        <ArrowUpRight color={isSurplusPositive ? "var(--color-success)" : "var(--color-danger)"} size={24} />
                    </div>
                    <div style={valueContainerStyle}>
                        <span style={{ ...valueStyle, color: isSurplusPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {isSurplusPositive ? '+' : ''}{surplus} kWh
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            {isSurplusPositive ? 'Available to sell' : 'Drawing from grid'}
                        </span>
                    </div>
                </div>

                {/* Token Balance Card */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Wallet Balance</h3>
                        <Wallet color="var(--color-primary)" size={24} />
                    </div>
                    <div style={valueContainerStyle}>
                        <span style={valueStyle}>₹{user?.walletBalance?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ ...cardStyle, height: '16rem', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '1rem' }}>AI Forecast (Next 24h)</h3>
                    {aiError ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', textAlign: 'center' }}>
                            <p>Error: {aiError}</p>
                        </div>
                    ) : prediction ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                Expected Net Surplus: <span style={{ fontWeight: 'bold', color: prediction.netSurplus >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    {prediction.netSurplus >= 0 ? '+' : ''}{prediction.netSurplus} kWh
                                </span>
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Recommendation: <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{prediction.recommendation}</span>
                            </p>
                            <div style={{ marginTop: '1rem', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: prediction.netSurplus >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                    opacity: 0.7
                                }} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                            Loading forecast...
                        </div>
                    )}
                </div>
                <div style={{ ...cardStyle, height: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Recent Trades (Coming Soon)</p>
                </div>
            </div>
        </Layout>
    );
}
