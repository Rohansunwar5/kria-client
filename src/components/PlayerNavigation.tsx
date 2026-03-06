import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export const PlayerNavigation = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    return (
        <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Kria Sports Logo" className="h-10 w-auto" />
                <span className="text-2xl font-oswald font-bold tracking-widest text-white">KRIA</span>
            </Link>

            {/* Middle Menu */}
            <div className="flex items-center gap-12 pt-2">
                <div className="flex flex-col items-center cursor-pointer group">
                    <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-lg font-medium">Tournaments</span>
                    </div>
                    <div className="h-0.5 w-full bg-primary mt-1"></div> {/* Active Underline */}
                </div>
                <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors pb-1.5">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-lg font-medium">Players</span>
                </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-6">
                <Link to="/player/profile" className="flex items-center gap-4 cursor-pointer group">
                    <span className="text-primary font-oswald text-xl font-medium tracking-wide group-hover:text-white transition-colors">
                        {user ? `${user.firstName}`.toUpperCase() : 'PROFILE'}
                    </span>
                    <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-zinc-800 flex items-center justify-center group-hover:border-primary transition-colors text-white font-bold text-lg">
                        {user ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-oswald tracking-wide font-medium">LOGOUT</span>
                </button>
            </div>
        </nav>
    );
};
