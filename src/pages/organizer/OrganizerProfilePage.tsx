import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Share2, Settings, CalendarCheck, Bookmark, FileText, Users, Newspaper, User, PlusCircle, Store, LogOut, Pencil, Save, Loader2 } from 'lucide-react';
import HoverFooter from '@/components/HoverFooter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateProfile } from '../../store/slices/authSlice';

const DashboardCard = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 overflow-hidden aspect-square"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300 ease-out z-10" strokeWidth={1.5} />
        <span className="text-lg font-bold font-oswald tracking-wide text-white z-10 group-hover:text-primary transition-colors">{title}</span>
    </div>
);

const OrganizerProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, role, isLoading } = useAppSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ firstName: '', lastName: '', phone: '' });

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const startEditing = () => {
        setEditData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!role) return;
        const result = await dispatch(updateProfile({ role, data: editData }));
        if (updateProfile.fulfilled.match(result)) {
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-montserrat flex flex-col items-center relative overflow-hidden">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Header */}
            <header className="w-full flex items-center justify-between px-8 py-6 max-w-7xl z-10">
                <button
                    onClick={() => navigate('/organizer/home')}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary hover:text-primary transition-all text-white font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-7xl px-8 mt-4 mb-24 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 z-10">

                {/* Left Profile Card */}
                <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 flex flex-col shadow-2xl relative overflow-hidden h-fit">
                    {/* Top utilities */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-oswald font-bold tracking-widest text-white">ORGANIZER</h2>
                        </div>
                        <div className="flex gap-4 text-gray-400">
                            <UserPlus className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
                            <Share2 className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
                            <Settings className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* Avatar & Basic Info */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="h-28 w-28 rounded-full border-2 border-primary text-4xl text-white overflow-hidden bg-black p-1 flex items-center justify-center">
                            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center font-bold">
                                {user ? user.firstName[0].toUpperCase() : 'O'}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="flex flex-col gap-3 w-full">
                                <input
                                    value={editData.firstName} onChange={e => setEditData(p => ({ ...p, firstName: e.target.value }))}
                                    placeholder="First Name"
                                    className="w-full px-4 py-2.5 rounded-full bg-black/50 border border-white/10 text-white text-center focus:outline-none focus:border-primary"
                                />
                                <input
                                    value={editData.lastName} onChange={e => setEditData(p => ({ ...p, lastName: e.target.value }))}
                                    placeholder="Last Name"
                                    className="w-full px-4 py-2.5 rounded-full bg-black/50 border border-white/10 text-white text-center focus:outline-none focus:border-primary"
                                />
                                <input
                                    value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="Phone"
                                    className="w-full px-4 py-2.5 rounded-full bg-black/50 border border-white/10 text-white text-center focus:outline-none focus:border-primary"
                                />
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-2xl font-bold font-oswald tracking-wide text-white">
                                    {user ? `${user.firstName} ${user.lastName}` : 'Organizer Name'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 w-full mt-2">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={isLoading} className="flex-1 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                                    </button>
                                </div>
                            ) : (
                                <button onClick={startEditing} className="w-full py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <Pencil className="h-3.5 w-3.5" /> Edit Profile
                                </button>
                            )}
                            <button onClick={handleLogout} className="w-full py-2 rounded-full border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/10 mb-8" />

                    {/* Stats List */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-primary font-medium text-sm">Mobile</span>
                            <div className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white font-medium text-lg">
                                {user?.phone || '+91 9999999999'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-primary font-medium text-sm">Active Events</span>
                            <div className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white font-medium text-lg">
                                3
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-primary font-medium text-sm">Total Players Hosted</span>
                            <div className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white font-medium text-lg">
                                1,248
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-primary font-medium text-sm">Location</span>
                            <div className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white font-medium text-lg">
                                Bangalore
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Dashboard Grid */}
                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-6 align-start content-start">
                    <DashboardCard icon={CalendarCheck} title="Tournaments" />
                    <DashboardCard icon={Bookmark} title="Drafts" />
                    <DashboardCard icon={FileText} title="Invoice" />
                    <DashboardCard icon={Users} title="Organizers" />
                    <DashboardCard icon={UserPlus} title="Partners" />
                    <DashboardCard icon={Newspaper} title="Notices" />
                    <DashboardCard icon={User} title="Profile" />
                    <DashboardCard icon={PlusCircle} title="Create Tournament" onClick={() => navigate('/organizer/tournament/create')} />
                    <DashboardCard icon={Store} title="Sponsors" />
                </div>
            </main>

            <HoverFooter />
        </div>
    );
};

export default OrganizerProfilePage;
