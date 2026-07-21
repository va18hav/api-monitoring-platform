import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductTabs } from '../components/ProductTabs';
import { Stats } from '../components/Stats';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { useVerifySession } from '../../auth/hooks/useAuth';

export const LandingPage: React.FC = () => {
    useVerifySession();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden flex flex-col justify-between">
            <Navbar />
            <main className="flex-1">
                <Hero />
                <div className="px-6 lg:px-12">
                    <ProductTabs />
                </div>
                <Stats />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
};
