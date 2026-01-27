import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="layout">
            <Navbar />
            <main className="container" style={{ paddingBottom: '2rem', paddingTop: '2rem' }}>
                {children}
            </main>
        </div>
    );
}
