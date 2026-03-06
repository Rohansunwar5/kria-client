import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar as CalendarIcon, Users, Settings, LogOut, ChevronRight, Loader2, MapPin, Trophy, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import HoverFooter from '@/components/HoverFooter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchMyTournaments, Tournament } from '../../store/slices/tournamentSlice';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Draft' },
    registration_open: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Registration Open' },
    registration_closed: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Registration Closed' },
    auction_in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Auction In Progress' },
    ongoing: { bg: 'bg-primary/10', text: 'text-primary', label: 'Ongoing' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completed' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Cancelled' },
};

const sportLabels: Record<string, string> = {
    badminton: 'Badminton',
    cricket: 'Cricket',
    football: 'Football',
    kabaddi: 'Kabaddi',
    table_tennis: 'Table Tennis',
    tennis: 'Tennis',
};

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
    const status = statusColors[tournament.status] || statusColors.draft;
    return (
        <Link
            to={`/organizer/tournament/${tournament._id}`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/10 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold font-oswald text-white group-hover:text-primary transition-colors">{tournament.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span>{sportLabels[tournament.sport] || tournament.sport}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{tournament.venue?.city}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                        {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' — '}
                        {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border border-current/20`}>
                            {status.label}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors">
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </Link>
    );
};

const OrganizerHomePage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { myTournaments, isLoading, error } = useAppSelector((state) => state.tournament);

    useEffect(() => {
        dispatch(fetchMyTournaments());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-montserrat flex flex-col items-center">
            {/* Top Navigation */}
            <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src={logo} alt="Kria Sports Logo" className="h-10 w-auto" />
                    <span className="text-2xl font-oswald font-bold tracking-widest text-white">KRIA</span>
                </Link>

                {/* Profile/Actions */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/organizer/tournament/create')}
                        className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all font-oswald tracking-wide"
                    >
                        <PlusCircle className="h-4 w-4" />
                        CREATE TOURNAMENT
                    </button>
                    <Link to="/organizer/profile" className="flex items-center gap-4 cursor-pointer group">
                        <span className="text-white font-medium tracking-wide">
                            {user ? `${user.firstName}`.toUpperCase() : 'ORGANIZER'}
                        </span>
                        <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-zinc-800 flex items-center justify-center group-hover:border-primary transition-colors text-white font-bold text-lg">
                            {user ? user.firstName[0].toUpperCase() : 'O'}
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

            {/* Dashboard Content */}
            <main className="w-full max-w-7xl px-8 mt-12 mb-24 flex flex-col gap-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-oswald font-bold tracking-wide text-white uppercase flex items-center gap-3">
                            <span className="text-primary">✦</span> Dashboard
                        </h1>
                        <p className="text-gray-400 mt-3 text-sm max-w-xl leading-relaxed">
                            Manage your tournaments, view live registrations, and oversee your sporting events all in one place.
                        </p>
                    </div>

                    {/* Mobile Create Button */}
                    <button
                        onClick={() => navigate('/organizer/tournament/create')}
                        className="md:hidden flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold w-full"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Create New Tournament
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                        <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
                            <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold font-oswald text-white mb-1">
                                {myTournaments.filter(t => ['registration_open', 'ongoing', 'auction_in_progress'].includes(t.status)).length}
                            </p>
                            <p className="text-sm font-medium text-gray-400">Active Tournaments</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                        <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold font-oswald text-white mb-1">{myTournaments.length}</p>
                            <p className="text-sm font-medium text-gray-400">Total Tournaments</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                        <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold font-oswald text-white mb-1">
                                {myTournaments.filter(t => t.status === 'draft').length}
                            </p>
                            <p className="text-sm font-medium text-gray-400">Drafts</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden cursor-pointer hover:bg-white/10 transition-colors border-dashed border-primary hover:border-solid items-center justify-center text-center"
                        onClick={() => navigate('/organizer/tournament/create')}
                    >
                        <div className="p-4 bg-primary rounded-full text-white shadow-lg shadow-primary/20 mb-2 hover:scale-110 transition-transform">
                            <PlusCircle className="h-6 w-6" />
                        </div>
                        <p className="font-oswald font-medium tracking-wide">Start New Event</p>
                    </div>
                </div>

                {/* My Tournaments List */}
                <div className="flex flex-col gap-6 mt-8">
                    <h2 className="text-2xl font-oswald font-bold tracking-wide text-white flex items-center gap-2">
                        My Tournaments
                    </h2>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isLoading && !error && myTournaments.length === 0 && (
                        <div className="text-center py-16">
                            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-oswald font-bold text-gray-400 mb-2">No tournaments yet</h3>
                            <p className="text-gray-500 text-sm mb-6">Create your first tournament to get started.</p>
                            <button
                                onClick={() => navigate('/organizer/tournament/create')}
                                className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium font-oswald tracking-wide transition-all"
                            >
                                <PlusCircle className="h-4 w-4 inline mr-2" />
                                Create Tournament
                            </button>
                        </div>
                    )}

                    {!isLoading && myTournaments.map(tournament => (
                        <TournamentCard key={tournament._id} tournament={tournament} />
                    ))}
                </div>
            </main>

            <HoverFooter />
        </div>
    );
};

export default OrganizerHomePage;
