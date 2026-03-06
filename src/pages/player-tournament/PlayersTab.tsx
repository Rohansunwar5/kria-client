import React from 'react';
import { Loader2 } from 'lucide-react';
import { Registration } from '../../store/slices/registrationSlice';
import { Team } from '../../store/slices/teamSlice';
import { Category } from '../../store/slices/registrationSlice';

interface Props {
    categories: Category[];
    selectedPlayerCategory: string;
    setSelectedPlayerCategory: (id: string) => void;
    categoryRegistrations: Registration[];
    isRegLoading: boolean;
    teams: Team[];
}

const PlayersTab: React.FC<Props> = ({ categories, selectedPlayerCategory, setSelectedPlayerCategory, categoryRegistrations, isRegLoading, teams }) => {
    const visibleRegs = categoryRegistrations.filter(r =>
        r.status === 'approved' || r.status === 'assigned' || r.status === 'auctioned'
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h3 className="text-2xl font-oswald font-bold tracking-wide">Approved Players</h3>
                {categories.length > 0 && (
                    <select
                        value={selectedPlayerCategory}
                        onChange={e => setSelectedPlayerCategory(e.target.value)}
                        className="bg-black/50 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    >
                        <option value="" disabled>Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {isRegLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : !selectedPlayerCategory ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-400">Please select a category to view players.</div>
            ) : visibleRegs.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-400">No players have been approved for this category yet.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleRegs.map(reg => {
                        const assignedTeam = reg.status === 'auctioned' && reg.teamId ? teams.find(t => t._id === reg.teamId) : null;
                        return (
                            <div key={reg._id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-3xl p-5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-oswald text-xl shrink-0 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reg.profile?.firstName}${reg.profile?.lastName}&backgroundColor=transparent`}
                                        alt="player"
                                        className="w-full h-full object-cover mix-blend-screen"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white capitalize">{reg.profile?.firstName} {reg.profile?.lastName}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-xs bg-black/40 text-gray-300 px-2 py-0.5 rounded border border-white/5 capitalize">
                                            {reg.profile?.gender}
                                        </span>
                                        {reg.status === 'assigned' && reg.teamId && (
                                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                                Assigned to Team
                                            </span>
                                        )}
                                        {assignedTeam && (
                                            <span
                                                className="text-xs px-2 py-0.5 rounded border font-bold"
                                                style={{ color: assignedTeam.primaryColor || '#F97316', borderColor: `${assignedTeam.primaryColor || '#F97316'}40`, background: `${assignedTeam.primaryColor || '#F97316'}15` }}
                                            >
                                                {assignedTeam.name}
                                            </span>
                                        )}
                                        {reg.status === 'approved' && (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Verified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PlayersTab;
