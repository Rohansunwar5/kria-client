import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Clock, Gavel, CheckCircle, UserX } from 'lucide-react';
import API from '../../api/axios';
import { Category } from '../../store/slices/registrationSlice';

interface AuctionLog {
    _id: string;
    registrationId: string;
    playerName: string;
    teamId: string;
    teamName: string;
    finalPrice: number;
    auctionType: string;
    timestamp: string;
}

interface Props {
    categories: Category[];
    tournamentId: string;
}

const AuctionTab: React.FC<Props> = ({ categories, tournamentId }) => {
    const navigate = useNavigate();
    const [selectedCat, setSelectedCat] = useState<string>('');
    const [logs, setLogs] = useState<AuctionLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (categories.length > 0 && !selectedCat) {
            setSelectedCat(categories[0]._id);
        }
    }, [categories, selectedCat]);

    useEffect(() => {
        if (!selectedCat) return;
        const fetchLogs = async () => {
            setIsLoadingLogs(true);
            try {
                const res = await API.get(`/auction/${tournamentId}/${selectedCat}/sold-log`);
                // Server wraps: res.data = { data: { success, message, data: { logs, totalSold, totalRevenue } } }
                const payload = res.data?.data?.data || res.data?.data || {};
                const data = payload?.logs || [];
                setLogs(Array.isArray(data) ? data : []);
            } catch {
                setLogs([]);
            } finally {
                setIsLoadingLogs(false);
            }
        };
        fetchLogs();
    }, [selectedCat, tournamentId]);

    const getStatusConfig = (status: string) => {
        if (status === 'auction_in_progress') return { label: 'Live Now', color: 'bg-red-500/10 text-red-400 border-red-500/20', live: true };
        if (status === 'ongoing' || status === 'completed') return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', live: false };
        return { label: 'Upcoming', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', live: false };
    };

    if (categories.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-400">
                No categories have been announced for this tournament yet.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-oswald font-bold tracking-wide mb-2">Auction</h3>

            {/* Category cards */}
            <div className="flex flex-col gap-4">
                {categories.map(category => {
                    const { label, color, live } = getStatusConfig(category.status);
                    return (
                        <div key={category._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <h4 className="text-xl font-bold font-oswald tracking-wide text-white">{category.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${color}`}>
                                    {live && <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
                                    {label}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/auction/${tournamentId}/${category._id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider whitespace-nowrap"
                            >
                                Watch Live <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Sold Log */}
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-xl font-oswald font-bold tracking-wide flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-primary" /> Sold Log
                    </h4>
                    {categories.length > 1 && (
                        <select
                            value={selectedCat}
                            onChange={e => setSelectedCat(e.target.value)}
                            className="bg-black/50 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {isLoadingLogs ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : logs.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                        <Gavel className="h-8 w-8 mx-auto mb-3 opacity-30" />
                        No players have been sold in this category yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Header row */}
                        <div className="grid grid-cols-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold px-4">
                            <span>#</span>
                            <span>Player</span>
                            <span>Team</span>
                            <span className="text-right">Amount</span>
                        </div>

                        {logs.map((log, idx) => (
                            <div
                                key={log._id}
                                className="grid grid-cols-4 items-center gap-2 bg-white/5 border border-white/8 hover:border-white/15 transition-colors rounded-2xl px-4 py-4 group"
                            >
                                {/* Index */}
                                <span className="text-gray-500 font-bold text-sm">#{idx + 1}</span>

                                {/* Player name + avatar */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden shrink-0">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.playerName}&backgroundColor=transparent`}
                                            alt={log.playerName}
                                            className="w-full h-full object-cover mix-blend-screen scale-125"
                                        />
                                    </div>
                                    <span className="text-white font-semibold text-sm capitalize truncate">{log.playerName}</span>
                                </div>

                                {/* Team */}
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    <span className="text-emerald-400 font-semibold text-sm capitalize truncate">{log.teamName}</span>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    <span className="text-primary font-black text-base font-oswald">₹{log.finalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}

                        {/* Summary footer */}
                        <div className="mt-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{logs.length} player{logs.length !== 1 ? 's' : ''} sold</span>
                            <span className="text-primary font-black font-oswald text-lg">
                                ₹{logs.reduce((sum, l) => sum + l.finalPrice, 0).toLocaleString()} total
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionTab;
