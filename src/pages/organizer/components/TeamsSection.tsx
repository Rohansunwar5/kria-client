import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Edit2, Loader2, Save, X, DollarSign, RefreshCw, Smartphone, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTournamentTeams, createTeam, updateTeam, deleteTeam, updateTeamBudget, resetTeamBudget, clearTeams } from '../../../store/slices/teamSlice';
import { Input } from '@/components/ui/input';

interface TeamsSectionProps {
    tournamentId: string;
    defaultBudget: number;
}

const TeamsSection: React.FC<TeamsSectionProps> = ({ tournamentId, defaultBudget }) => {
    const dispatch = useAppDispatch();
    const { teams, isLoading, error } = useAppSelector(state => state.team);

    const [isAdding, setIsAdding] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        name: '', logo: '', primaryColor: '#ffffff', secondaryColor: '#000000',
        ownerName: '', ownerPhone: '', ownerEmail: '', whatsappGroupLink: '',
        initialBudget: defaultBudget,
    });

    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editTeamData, setEditTeamData] = useState({
        name: '', logo: '', primaryColor: '', secondaryColor: '',
        ownerName: '', ownerPhone: '', ownerEmail: '', whatsappGroupLink: '',
        budget: 0,
    });

    useEffect(() => {
        dispatch(fetchTournamentTeams(tournamentId));
        return () => { dispatch(clearTeams()); };
    }, [dispatch, tournamentId]);

    const handleCreateTeam = async () => {
        if (!formData.name.trim() || !formData.ownerName.trim() || !formData.ownerPhone.trim()) return;

        const payload = {
            tournamentId,
            teamData: {
                name: formData.name, logo: formData.logo,
                primaryColor: formData.primaryColor, secondaryColor: formData.secondaryColor,
                owner: { name: formData.ownerName, phone: formData.ownerPhone, email: formData.ownerEmail },
                whatsappGroupLink: formData.whatsappGroupLink,
                initialBudget: formData.initialBudget,
                budget: formData.initialBudget,
            }
        };

        const result = await dispatch(createTeam(payload));
        if (createTeam.fulfilled.match(result)) {
            setIsAdding(false);
            setFormData({
                name: '', logo: '', primaryColor: '#ffffff', secondaryColor: '#000000',
                ownerName: '', ownerPhone: '', ownerEmail: '', whatsappGroupLink: '',
                initialBudget: defaultBudget,
            });
        }
    };

    const handleUpdateTeam = async (id: string) => {
        if (!editTeamData.name.trim() || !editTeamData.ownerName.trim() || !editTeamData.ownerPhone.trim()) return;

        const team = teams.find(t => t._id === id);
        if (!team) return;

        const payload = {
            name: editTeamData.name, logo: editTeamData.logo,
            primaryColor: editTeamData.primaryColor, secondaryColor: editTeamData.secondaryColor,
            owner: { name: editTeamData.ownerName, phone: editTeamData.ownerPhone, email: editTeamData.ownerEmail },
            whatsappGroupLink: editTeamData.whatsappGroupLink,
        };

        await dispatch(updateTeam({ id, data: payload }));

        // Update budget if changed
        if (team.budget !== editTeamData.budget) {
            await dispatch(updateTeamBudget({ id, amount: editTeamData.budget }));
        }

        setEditingTeamId(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            await dispatch(deleteTeam(id));
        }
    };

    const handleResetBudget = async (id: string) => {
        if (window.confirm('Reset budget to original amount? This cannot be undone.')) {
            await dispatch(resetTeamBudget(id));
        }
    };

    const startEditing = (team: any) => {
        setEditingTeamId(team._id);
        setEditTeamData({
            name: team.name, logo: team.logo || '',
            primaryColor: team.primaryColor || '#ffffff', secondaryColor: team.secondaryColor || '#000000',
            ownerName: team.owner.name, ownerPhone: team.owner.phone, ownerEmail: team.owner.email || '',
            whatsappGroupLink: team.whatsappGroupLink || '',
            budget: team.budget || 0,
        });
    };

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Teams ({teams.length})</h2>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary font-medium transition-colors text-sm">
                        <Plus className="h-4 w-4" /> Add Team
                    </button>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="flex flex-col gap-4 p-6 bg-black/40 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-oswald font-bold">New Team Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Team Name *</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Royal Challengers" className="bg-black/50 border-white/10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Logo URL</label>
                            <Input value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="bg-black/50 border-white/10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Budget *</label>
                            <Input type="number" value={formData.initialBudget} onChange={e => setFormData({ ...formData, initialBudget: Number(e.target.value) })} className="bg-black/50 border-white/10 text-white" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Owner Name *</label>
                            <Input value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} placeholder="Owner Name" className="bg-black/50 border-white/10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Owner Phone *</label>
                            <Input value={formData.ownerPhone} onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })} placeholder="Phone number" className="bg-black/50 border-white/10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Owner Email</label>
                            <Input type="email" value={formData.ownerEmail} onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })} placeholder="Email (optional)" className="bg-black/50 border-white/10 text-white" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Primary Color</label>
                            <div className="flex gap-2">
                                <Input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="bg-black/50 border-white/10 p-1 w-12 h-10" />
                                <Input value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="bg-black/50 border-white/10 text-white flex-1" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Secondary Color</label>
                            <div className="flex gap-2">
                                <Input type="color" value={formData.secondaryColor} onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })} className="bg-black/50 border-white/10 p-1 w-12 h-10" />
                                <Input value={formData.secondaryColor} onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })} className="bg-black/50 border-white/10 text-white flex-1" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">WhatsApp Group Link</label>
                            <Input value={formData.whatsappGroupLink} onChange={e => setFormData({ ...formData, whatsappGroupLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." className="bg-black/50 border-white/10 text-white" />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
                        <button onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleCreateTeam} disabled={isLoading || !formData.name.trim() || !formData.ownerName.trim() || !formData.ownerPhone.trim()} className="px-8 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Team'}
                        </button>
                    </div>
                </div>
            )}

            {isLoading && !isAdding && teams.length === 0 ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : teams.length === 0 && !isAdding ? (
                <div className="text-center py-10 text-gray-500">No teams added yet. Create one to get started.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map(team => (
                        <div key={team._id} className="bg-black/30 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors flex flex-col gap-4 relative overflow-hidden">
                            {/* Color strip */}
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, ${team.primaryColor || '#ff0000'}, ${team.secondaryColor || '#0000ff'})` }}></div>

                            {editingTeamId === team._id ? (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input value={editTeamData.name} onChange={e => setEditTeamData(p => ({ ...p, name: e.target.value }))} placeholder="Team Name" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <Input type="number" value={editTeamData.budget} onChange={e => setEditTeamData(p => ({ ...p, budget: Number(e.target.value) }))} placeholder="Budget" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <Input value={editTeamData.logo} onChange={e => setEditTeamData(p => ({ ...p, logo: e.target.value }))} placeholder="Logo URL" className="bg-black/50 border-white/10 text-white h-8 text-xs col-span-2" />
                                        <Input value={editTeamData.ownerName} onChange={e => setEditTeamData(p => ({ ...p, ownerName: e.target.value }))} placeholder="Owner Name" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <Input value={editTeamData.ownerPhone} onChange={e => setEditTeamData(p => ({ ...p, ownerPhone: e.target.value }))} placeholder="Owner Phone" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <Input value={editTeamData.ownerEmail} onChange={e => setEditTeamData(p => ({ ...p, ownerEmail: e.target.value }))} placeholder="Owner Email" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <Input value={editTeamData.whatsappGroupLink} onChange={e => setEditTeamData(p => ({ ...p, whatsappGroupLink: e.target.value }))} placeholder="WhatsApp Link" className="bg-black/50 border-white/10 text-white h-8 text-xs" />
                                        <div className="flex gap-2 col-span-2">
                                            <Input type="color" value={editTeamData.primaryColor} onChange={e => setEditTeamData(p => ({ ...p, primaryColor: e.target.value }))} className="bg-black/50 border-white/10 p-0.5 w-8 h-8" title="Primary Color" />
                                            <Input type="color" value={editTeamData.secondaryColor} onChange={e => setEditTeamData(p => ({ ...p, secondaryColor: e.target.value }))} className="bg-black/50 border-white/10 p-0.5 w-8 h-8" title="Secondary Color" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setEditingTeamId(null)} className="flex-1 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-medium">Cancel</button>
                                        <button onClick={() => handleUpdateTeam(team._id)} className="flex-1 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-medium">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-3">
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full object-cover bg-black" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold" style={{ backgroundColor: team.primaryColor }}>
                                                    {team.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold font-oswald tracking-wide leading-tight">{team.name}</h3>
                                                <p className="text-xs text-gray-400 font-medium">Owner: {team.owner.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditing(team)} className="p-1.5 hover:bg-white/10 rounded-md text-amber-400" title="Edit Team"><Edit2 className="h-3.5 w-3.5" /></button>
                                            <button onClick={() => handleDelete(team._id)} className="p-1.5 hover:bg-white/10 rounded-md text-red-400" title="Delete Team"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                                        {team.owner.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {team.owner.phone}</div>}
                                        {team.owner.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {team.owner.email}</div>}
                                        {team.whatsappGroupLink && (
                                            <a href={team.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-400 hover:underline">
                                                <Smartphone className="h-3 w-3" /> WhatsApp Group <ExternalLink className="h-2.5 w-2.5" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs mt-2">
                                        {(() => {
                                            const initialBudget = team.initialBudget || 0;
                                            const currentBudget = team.budget || 0;
                                            const spent = initialBudget - currentBudget;
                                            const remaining = currentBudget;
                                            return (
                                                <>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-500 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total Budget</span>
                                                        <span className="font-medium">₹{initialBudget.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-500">Spent</span>
                                                        <span className="font-medium text-amber-500">₹{spent.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 col-span-2 pt-2 border-t border-white/5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">Remaining</span>
                                                            <button onClick={() => handleResetBudget(team._id)} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5" /> reset</button>
                                                        </div>
                                                        <span className={`font-bold text-lg ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>₹{remaining.toLocaleString()}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default TeamsSection;
