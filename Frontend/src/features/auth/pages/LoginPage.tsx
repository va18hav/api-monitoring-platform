import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                {/* Logo and title */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-2">
                        <Activity size={28} className="stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">PingLoop Access</h2>
                    <p className="text-sm text-slate-500">
                        Sign in to monitor your distributed systems
                    </p>
                </div>

                {/* Form */}
                <LoginForm />

                {/* Navigation links */}
                <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
