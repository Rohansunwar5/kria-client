import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Trash2, MapPin, Calendar, Users, DollarSign, Settings, Image as ImageIcon,
    Loader2, AlertCircle, CheckCircle, Play, XCircle, DoorOpen, Lock, Gavel
} from 'lucide-react';
import HoverFooter from '@/components/HoverFooter';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchTournament, updateTournament, deleteTournament,
    openRegistration, closeRegistration, startAuction,
    startTournament, completeTournament, cancelTournament,
    clearCurrentTournament,
} from '../../store/slices/tournamentSlice';
import { fetchTournamentCategories } from '../../store/slices/registrationSlice';
import TeamsSection from './components/TeamsSection';
import StaffSection from './components/StaffSection';
import CategoriesSection from './components/CategoriesSection';
import RegistrationsSection from './components/RegistrationsSection';
import AuctionSection from './components/AuctionSection';
import MatchManagementSection from './components/MatchManagementSection';
import BracketManagementSection from './components/BracketManagementSection';

const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Draft' },
    registration_open: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30', label: 'Registration Open' },
    registration_closed: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30', label: 'Registration Closed' },
    auction_in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', label: 'Auction In Progress' },
    ongoing: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', label: 'Ongoing' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', label: 'Completed' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', label: 'Cancelled' },
};

const TournamentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentTournament, isLoading, error } = useAppSelector((state) => state.tournament);
    const { categories } = useAppSelector((state) => state.registration);

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', sport: 'badminton', bannerImage: '',
        startDate: '', endDate: '', registrationDeadline: '',
        venue: { name: '', address: '', city: '' },
        settings: { maxTeams: 8, defaultBudget: 100000, auctionType: 'manual', allowLateRegistration: false },
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchTournament(id));
            dispatch(fetchTournamentCategories(id));
        }
        return () => { dispatch(clearCurrentTournament()); };
    }, [id, dispatch]);

    useEffect(() => {
        if (currentTournament) {
            setFormData({
                name: currentTournament.name || '',
                description: currentTournament.description || '',
                sport: currentTournament.sport || 'badminton',
                bannerImage: currentTournament.bannerImage || '',
                startDate: currentTournament.startDate ? currentTournament.startDate.split('T')[0] : '',
                endDate: currentTournament.endDate ? currentTournament.endDate.split('T')[0] : '',
                registrationDeadline: currentTournament.registrationDeadline ? currentTournament.registrationDeadline.split('T')[0] : '',
                venue: {
                    name: currentTournament.venue?.name || '',
                    address: currentTournament.venue?.address || '',
                    city: currentTournament.venue?.city || '',
                },
                settings: {
                    maxTeams: currentTournament.settings?.maxTeams || 8,
                    defaultBudget: currentTournament.settings?.defaultBudget || 100000,
                    auctionType: currentTournament.settings?.auctionType || 'manual',
                    allowLateRegistration: currentTournament.settings?.allowLateRegistration || false,
                },
            });
        }
    }, [currentTournament]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('venue.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, venue: { ...prev.venue, [field]: value } }));
        } else if (name.startsWith('settings.')) {
            const field = name.split('.')[1];
            let parsed: any = value;
            if (type === 'number') parsed = Number(value);
            if (type === 'checkbox') parsed = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, settings: { ...prev.settings, [field]: parsed } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!id) return;
        const result = await dispatch(updateTournament({ id, data: formData }));
        if (updateTournament.fulfilled.match(result)) {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        const result = await dispatch(deleteTournament(id));
        if (deleteTournament.fulfilled.match(result)) {
            navigate('/organizer/home');
        }
    };

    const handleStatusAction = async (action: any) => {
        if (!id) return;
        await dispatch(action(id));
    };

    if (isLoading && !currentTournament) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentTournament && !isLoading) {
        return (
            <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-lg">Tournament not found</p>
                <button onClick={() => navigate('/organizer/home')} className="px-6 py-2 bg-primary rounded-full text-white font-medium">
                    Go Back
                </button>
            </div>
        );
    }

    const status = statusColors[currentTournament?.status || 'draft'] || statusColors.draft;

    // Determine which status action is available
    const getStatusActions = () => {
        const s = currentTournament?.status;
        const actions: { label: string; icon: any; action: any; color: string }[] = [];

        if (s === 'draft') {
            actions.push({ label: 'Open Registration', icon: DoorOpen, action: openRegistration, color: 'bg-green-600 hover:bg-green-700' });
        }
        if (s === 'registration_open') {
            actions.push({ label: 'Close Registration', icon: Lock, action: closeRegistration, color: 'bg-yellow-600 hover:bg-yellow-700' });
        }
        if (s === 'registration_closed') {
            actions.push({ label: 'Start Auction', icon: Gavel, action: startAuction, color: 'bg-blue-600 hover:bg-blue-700' });
        }
        if (s === 'auction_in_progress') {
            actions.push({ label: 'Start Tournament', icon: Play, action: startTournament, color: 'bg-primary hover:bg-primary/90' });
        }
        if (s === 'ongoing') {
            actions.push({ label: 'Complete Tournament', icon: CheckCircle, action: completeTournament, color: 'bg-emerald-600 hover:bg-emerald-700' });
        }
        if (s && !['completed', 'cancelled'].includes(s)) {
            actions.push({ label: 'Cancel Tournament', icon: XCircle, action: cancelTournament, color: 'bg-red-600 hover:bg-red-700' });
        }
        return actions;
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-montserrat flex flex-col items-center">
            {/* Header */}
            <header className="w-full flex items-center justify-between px-8 py-6 max-w-5xl z-10 sticky top-0 bg-[#111]/80 backdrop-blur-md border-b border-white/5">
                <button onClick={() => navigate('/organizer/home')} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-white font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.text} border ${status.border}`}>
                        {status.label}
                    </span>
                    {!isEditing && currentTournament?.status === 'draft' && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all font-oswald text-sm tracking-wide">
                            Edit Details
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm">Cancel</button>
                            <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all font-oswald text-sm tracking-wide disabled:opacity-50">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE
                            </button>
                        </>
                    )}
                </div>
            </header>

            {error && (
                <div className="w-full max-w-5xl px-8 mt-4">
                    <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" /> <span>{error}</span>
                    </div>
                </div>
            )}

            <main className="w-full max-w-5xl px-8 mt-8 mb-24 z-10 flex flex-col gap-10">
                {/* Tournament Name Banner */}
                <div>
                    {isEditing ? (
                        <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white text-3xl font-oswald font-bold py-4" />
                    ) : (
                        <h1 className="text-3xl md:text-4xl font-oswald font-bold tracking-wide text-white">{currentTournament?.name}</h1>
                    )}
                </div>

                {/* Status Actions */}
                {getStatusActions().length > 0 && (
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-oswald font-bold text-white tracking-wide mb-4">Quick Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            {getStatusActions().map(({ label, icon: Icon, action, color }) => (
                                <button
                                    key={label}
                                    onClick={() => handleStatusAction(action)}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium text-sm transition-all disabled:opacity-50 ${color}`}
                                >
                                    <Icon className="h-4 w-4" /> {label}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Basic Info */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><ImageIcon className="h-5 w-5" /></div>
                        <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Sport</Label>
                            {isEditing ? (
                                <select name="sport" className="flex h-12 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white appearance-none" value={formData.sport} onChange={handleInputChange}>
                                    <option value="badminton">Badminton</option><option value="cricket">Cricket</option><option value="football">Football</option>
                                    <option value="kabaddi">Kabaddi</option><option value="table_tennis">Table Tennis</option><option value="tennis">Tennis</option>
                                </select>
                            ) : (
                                <p className="text-white font-medium capitalize">{currentTournament?.sport?.replace('_', ' ')}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Banner Image URL</Label>
                            {isEditing ? (
                                <Input name="bannerImage" value={formData.bannerImage} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6" placeholder="https://..." />
                            ) : (
                                <p className="text-white font-medium truncate">{currentTournament?.bannerImage || '—'}</p>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-400">Description</Label>
                            {isEditing ? (
                                <textarea name="description" className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-3 text-sm text-white" value={formData.description} onChange={handleInputChange} />
                            ) : (
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{currentTournament?.description || 'No description provided.'}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Schedule */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
                        <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Schedule</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['startDate', 'endDate', 'registrationDeadline'].map(field => (
                            <div key={field} className="space-y-2">
                                <Label className="text-gray-400">{field === 'registrationDeadline' ? 'Reg. Deadline' : field === 'startDate' ? 'Start Date' : 'End Date'}</Label>
                                {isEditing ? (
                                    <Input name={field} type="date" className="bg-black/50 border-white/10 text-white py-6 [color-scheme:dark]" value={(formData as any)[field]} onChange={handleInputChange} />
                                ) : (
                                    <p className="text-white font-medium">
                                        {(currentTournament as any)?.[field]
                                            ? new Date((currentTournament as any)[field]).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Location */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><MapPin className="h-5 w-5" /></div>
                        <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Location</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-400">Venue Name</Label>
                            {isEditing ? <Input name="venue.name" value={formData.venue.name} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6" /> : <p className="text-white font-medium">{currentTournament?.venue?.name || '—'}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">City</Label>
                            {isEditing ? <Input name="venue.city" value={formData.venue.city} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6" /> : <p className="text-white font-medium">{currentTournament?.venue?.city || '—'}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Full Address</Label>
                            {isEditing ? <Input name="venue.address" value={formData.venue.address} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6" /> : <p className="text-white font-medium">{currentTournament?.venue?.address || '—'}</p>}
                        </div>
                    </div>
                </section>

                {/* Settings */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings className="h-5 w-5" /></div>
                        <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Tournament Rules & Auction</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Max Teams</Label>
                            {isEditing ? (
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input name="settings.maxTeams" type="number" min="2" value={formData.settings.maxTeams} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6 pl-10" />
                                </div>
                            ) : <p className="text-white font-medium">{currentTournament?.settings?.maxTeams}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Default Auction Budget</Label>
                            {isEditing ? (
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input name="settings.defaultBudget" type="number" min="0" value={formData.settings.defaultBudget} onChange={handleInputChange} className="bg-black/50 border-white/10 text-white py-6 pl-10" />
                                </div>
                            ) : <p className="text-white font-medium">₹{currentTournament?.settings?.defaultBudget?.toLocaleString()}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Auction Type</Label>
                            {isEditing ? (
                                <select name="settings.auctionType" className="flex h-12 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white appearance-none" value={formData.settings.auctionType} onChange={handleInputChange}>
                                    <option value="manual">Manual (Offline Draft)</option><option value="live">Live Interactive Auction</option>
                                </select>
                            ) : <p className="text-white font-medium capitalize">{currentTournament?.settings?.auctionType}</p>}
                        </div>
                        <div className="space-y-2 flex items-center h-full pt-6">
                            {isEditing ? (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" name="settings.allowLateRegistration" className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary" checked={formData.settings.allowLateRegistration} onChange={handleInputChange} />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">Allow Late Registration</span>
                                </label>
                            ) : (
                                <p className="text-white font-medium">{currentTournament?.settings?.allowLateRegistration ? '✅ Late Registration Allowed' : '❌ No Late Registration'}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Categories */}
                {currentTournament && id && (
                    <CategoriesSection tournamentId={id} />
                )}

                {/* Teams */}
                {currentTournament && id && (
                    <TeamsSection tournamentId={id} defaultBudget={currentTournament.settings?.defaultBudget || 100000} />
                )}

                {/* Player Registrations */}
                {currentTournament && id && (
                    <RegistrationsSection tournamentId={id} />
                )}

                {/* Auction Control Panel */}
                {currentTournament && id && !['draft', 'cancelled', 'completed'].includes(currentTournament.status) && (
                    <AuctionSection
                        tournamentId={id}
                        categories={categories.map(c => ({ _id: c._id, name: c.name, status: c.status }))}
                    />
                )}

                {/* Bracket Management (Visual Tree) */}
                {currentTournament && id && !['draft', 'cancelled'].includes(currentTournament.status) && (
                    <BracketManagementSection
                        tournamentId={id}
                        categories={categories.map(c => ({ _id: c._id, name: c.name, status: c.status }))}
                    />
                )}

                {/* Match Management (List View) */}
                {currentTournament && id && !['draft', 'cancelled'].includes(currentTournament.status) && (
                    <MatchManagementSection
                        tournamentId={id}
                        categories={categories.map(c => ({ _id: c._id, name: c.name, status: c.status }))}
                    />
                )}

                {/* Staff */}
                {currentTournament && id && (
                    <StaffSection tournamentId={id} staffIds={currentTournament.staffIds || []} />
                )}

                {/* Danger Zone */}
                {currentTournament?.status !== 'completed' && currentTournament?.status !== 'cancelled' && (
                    <section className="bg-red-950/20 border border-red-900/30 rounded-3xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-red-900/30 pb-4 mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Trash2 className="h-5 w-5" /></div>
                            <h2 className="text-2xl font-oswald font-bold text-red-400 tracking-wide">Danger Zone</h2>
                        </div>
                        <p className="text-red-300/70 text-sm">Deleting a tournament is permanent and cannot be undone. All associated data (teams, categories, registrations) will be lost.</p>
                        {!showDeleteConfirm ? (
                            <button onClick={() => setShowDeleteConfirm(true)} className="w-fit flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/50 text-red-500 font-medium hover:bg-red-500/10 transition-all">
                                <Trash2 className="h-4 w-4" /> Delete Tournament
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-red-300 text-sm font-medium">Are you sure?</span>
                                <button onClick={handleDelete} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Yes, Delete
                                </button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>

            <HoverFooter />
        </div>
    );
};

export default TournamentDetailPage;
