import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { useVerifySession } from '../../auth/hooks/useAuth';

export const LandingPage: React.FC = () => {
    // Trigger session validation queries on initial boot.
    // This syncs with the Zustand authStore and sets isAuthenticated automatically.
    useVerifySession();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden">
            <Navbar />
            <main className="flex-1">
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    );
};
