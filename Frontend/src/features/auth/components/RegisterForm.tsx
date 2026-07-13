import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';
import { toast } from 'sonner';

export const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const registerMutation = useRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        registerMutation.mutate({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Email Address
                </label>
                <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Password
                </label>
                <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Confirm Password
                </label>
                <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
            </div>

            <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {registerMutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <>
                        <UserPlus size={18} />
                        <span>Register</span>
                    </>
                )}
            </button>
        </form>
    );
};
