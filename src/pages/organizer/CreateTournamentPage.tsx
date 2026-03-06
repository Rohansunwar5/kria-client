import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Calendar, Users, DollarSign, Settings, Image as ImageIcon, Loader2 } from 'lucide-react';
import HoverFooter from '@/components/HoverFooter';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTournament } from '../../store/slices/tournamentSlice';

const CreateTournamentPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.tournament);

    // Default state matching ITournament schema
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sport: 'badminton',
        bannerImage: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        venue: {
            name: '',
            address: '',
            city: '',
        },
        settings: {
            maxTeams: 8,
            defaultBudget: 100000,
            auctionType: 'manual',
            allowLateRegistration: false,
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith('venue.')) {
            const venueField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                venue: { ...prev.venue, [venueField]: value }
            }));
        } else if (name.startsWith('settings.')) {
            const settingsField = name.split('.')[1];
            let parsedValue: any = value;

            // Handle specific types for settings
            if (type === 'number') parsedValue = Number(value);
            if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

            setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, [settingsField]: parsedValue }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(createTournament(formData));
        if (createTournament.fulfilled.match(result)) {
            navigate('/organizer/home');
        }
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-montserrat flex flex-col items-center">

            {/* Header */}
            <header className="w-full flex items-center justify-between px-8 py-6 max-w-4xl z-10 sticky top-0 bg-[#111]/80 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={() => navigate('/organizer/home')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors text-white font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <h1 className="text-xl font-oswald font-bold tracking-widest text-white uppercase">New Tournament</h1>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all font-oswald tracking-wide"
                >
                    <Save className="h-4 w-4" />
                    CREATE
                </button>
            </header>

            {/* Form Content */}
            <main className="w-full max-w-4xl px-8 mt-8 mb-24 z-10">
                <form onSubmit={handleSubmit} className="flex flex-col gap-12">

                    {/* Basic Info Section */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name" className="text-gray-400">Tournament Name *</Label>
                                <Input
                                    id="name" name="name" required
                                    placeholder="e.g. Kria Summer Smash 2026"
                                    className="bg-black/50 border-white/10 text-white py-6"
                                    value={formData.name} onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sport" className="text-gray-400">Sport *</Label>
                                <select
                                    id="sport" name="sport" required
                                    className="flex h-12 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white appearance-none"
                                    value={formData.sport} onChange={handleInputChange}
                                >
                                    <option value="badminton">Badminton</option>
                                    <option value="cricket">Cricket</option>
                                    <option value="football">Football</option>
                                    <option value="kabaddi">Kabaddi</option>
                                    <option value="table_tennis">Table Tennis</option>
                                    <option value="tennis">Tennis</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bannerImage" className="text-gray-400">Banner Image URL</Label>
                                <Input
                                    id="bannerImage" name="bannerImage"
                                    placeholder="https://example.com/image.jpg"
                                    className="bg-black/50 border-white/10 text-white py-6"
                                    value={formData.bannerImage} onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description" className="text-gray-400">Description</Label>
                                <textarea
                                    id="description" name="description"
                                    placeholder="Provide details about the tournament rules, prizes, etc."
                                    className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                    value={formData.description} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Schedule Section */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Schedule</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-gray-400">Start Date *</Label>
                                <Input
                                    id="startDate" name="startDate" type="date" required
                                    className="bg-black/50 border-white/10 text-white py-6 [color-scheme:dark]"
                                    value={formData.startDate} onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-gray-400">End Date *</Label>
                                <Input
                                    id="endDate" name="endDate" type="date" required
                                    className="bg-black/50 border-white/10 text-white py-6 [color-scheme:dark]"
                                    value={formData.endDate} onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registrationDeadline" className="text-gray-400">Reg. Deadline *</Label>
                                <Input
                                    id="registrationDeadline" name="registrationDeadline" type="date" required
                                    className="bg-black/50 border-white/10 text-white py-6 [color-scheme:dark]"
                                    value={formData.registrationDeadline} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Location Section */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Location</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="venue.name" className="text-gray-400">Venue Name *</Label>
                                <Input
                                    id="venue.name" name="venue.name" required
                                    placeholder="e.g. Kanteerava Stadium"
                                    className="bg-black/50 border-white/10 text-white py-6"
                                    value={formData.venue.name} onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="venue.city" className="text-gray-400">City *</Label>
                                <Input
                                    id="venue.city" name="venue.city" required
                                    placeholder="e.g. Bangalore"
                                    className="bg-black/50 border-white/10 text-white py-6"
                                    value={formData.venue.city} onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="venue.address" className="text-gray-400">Full Address</Label>
                                <Input
                                    id="venue.address" name="venue.address"
                                    placeholder="Optional detailed address"
                                    className="bg-black/50 border-white/10 text-white py-6"
                                    value={formData.venue.address} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Settings Section */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Tournament Rules & Auction</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="settings.maxTeams" className="text-gray-400">Max Teams</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="settings.maxTeams" name="settings.maxTeams" type="number" min="2"
                                        className="bg-black/50 border-white/10 text-white py-6 pl-10"
                                        value={formData.settings.maxTeams} onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="settings.defaultBudget" className="text-gray-400">Default Auction Budget</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        id="settings.defaultBudget" name="settings.defaultBudget" type="number" min="0"
                                        className="bg-black/50 border-white/10 text-white py-6 pl-10"
                                        value={formData.settings.defaultBudget} onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="settings.auctionType" className="text-gray-400">Auction Type</Label>
                                <select
                                    id="settings.auctionType" name="settings.auctionType"
                                    className="flex h-12 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white appearance-none"
                                    value={formData.settings.auctionType} onChange={handleInputChange}
                                >
                                    <option value="manual">Manual (Offline Draft)</option>
                                    <option value="live">Live Interactive Auction</option>
                                </select>
                            </div>

                            <div className="space-y-2 flex items-center h-full pt-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="settings.allowLateRegistration"
                                        className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary focus:ring-offset-black"
                                        checked={formData.settings.allowLateRegistration}
                                        onChange={handleInputChange}
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">Allow Late Registration</span>
                                </label>
                            </div>
                        </div>
                    </section>
                </form>
            </main>

            <HoverFooter />
        </div>
    );
};

export default CreateTournamentPage;
