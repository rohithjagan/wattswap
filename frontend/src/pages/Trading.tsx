import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Order {
    _id: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    pricePerUnit: number;
    status: string;
    filledQuantity: number;
    createdAt: string;
}

export default function Trading() {
    const { user } = useAuth();
    const { meterData } = useSocket();
    const [orders, setOrders] = useState<Order[]>([]);
    const [type, setType] = useState<'BUY' | 'SELL'>('SELL');
    const [quantity, setQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/trades/orders');
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        if (type === 'SELL' && (meterData?.surplus || 0) < quantity) {
            setMessage({ type: 'error', text: `Insufficient surplus energy. You have only ${meterData?.surplus.toFixed(2)} kWh available.` });
            return;
        }

        const totalCost = quantity * price;
        const currentBalance = user?.walletBalance || 0;
        if (type === 'BUY' && currentBalance < totalCost) {
            setMessage({ type: 'error', text: `Insufficient wallet balance. Total cost ₹${totalCost.toFixed(2)} exceeds your balance ₹${currentBalance.toFixed(2)}.` });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.post('/trades/order', {
                type,
                quantity: Number(quantity),
                pricePerUnit: Number(price)
            });
            setMessage({ type: 'success', text: 'Order placed successfully!' });
            fetchOrders();
            setQuantity(0);
            setPrice(0);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to place order' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        // Simple confirm for now
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.delete(`/trades/order/${id}`);
            fetchOrders();
        } catch (error) {
            console.error('Failed to cancel order', error);
        }
    };

    const cardStyle = {
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
    };

    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>P2P Trading</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Market Price: ₹3.50/kWh (Avg)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
                {/* Order Form */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} />
                        Place Order
                    </h3>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Your Surplus</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                            {meterData?.surplus.toFixed(2) || '0.00'} kWh
                        </p>
                    </div>

                    {message && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <button
                                type="button"
                                className={`btn ${type === 'BUY' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setType('BUY')}
                                style={{ flex: 1 }}
                            >
                                BUY
                            </button>
                            <button
                                type="button"
                                className={`btn ${type === 'SELL' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setType('SELL')}
                                style={{ flex: 1 }}
                            >
                                SELL
                            </button>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Quantity (kWh)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                step="0.1"
                                min="0.1"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Price per Unit (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                step="0.01"
                                min="0.1"
                                required
                            />
                        </div>

                        <div style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--color-border)',
                            marginTop: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold'
                        }}>
                            <span>Total</span>
                            <span>₹{((quantity || 0) * (price || 0)).toFixed(2)}</span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Place ${type} Order`}
                        </button>
                    </form>
                </div>

                {/* Orders List */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600 }}>Your Active Orders</h3>
                        <button onClick={fetchOrders} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Quantity</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Price</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Filled</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                color: order.type === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
                                                fontWeight: 500
                                            }}>
                                                {order.type === 'BUY' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                {order.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{order.quantity} kWh</td>
                                        <td style={{ padding: '0.75rem' }}>₹{order.pricePerUnit}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${(order.filledQuantity / order.quantity) * 100}%`,
                                                    height: '100%',
                                                    backgroundColor: 'var(--color-primary)'
                                                }} />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                {order.filledQuantity} / {order.quantity}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                backgroundColor: order.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                                color: order.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-text-secondary)'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {['PENDING', 'PARTIAL'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                                                    title="Cancel Order"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                            No active orders
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
