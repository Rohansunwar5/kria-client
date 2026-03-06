import React, { useEffect, useState, useCallback, useRef } from 'react';
import { auctionApi } from '../../../api/auction';
import API from '../../../api/axios';
import { AuctionStatus, Player, Team } from '../../../types';
import {
    Gavel, Play, SkipForward, Undo2, Pause, PlayCircle, CheckCircle,
    Loader2, Users, DollarSign, ChevronDown, X, AlertCircle, Trophy
} from 'lucide-react';

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const CONFETTI_COLORS = ['#F97316', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#fff'];

const ConfettiOverlay: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    return (
        <div className="confetti-container">
            {Array.from({ length: 60 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                        width: `${8 + Math.random() * 8}px`,
                        height: `${14 + Math.random() * 12}px`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
        </div>
    );
};

// ============================================================================
// TYPES
// ============================================================================
interface AuctionSectionProps {
    tournamentId: string;
    categories: { _id: string; name: string; status?: string }[];
}

interface AuctionFullState {
    auction: AuctionStatus;
    currentPlayer: Player | null;
    teams: Team[];
    category?: { _id: string; name: string } | null;
    tournament?: { _id: string; name: string } | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AuctionSection: React.FC<AuctionSectionProps> = ({ tournamentId, categories }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [auctionState, setAuctionState] = useState<AuctionFullState | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSellModal, setShowSellModal] = useState(false);
    const [sellForm, setSellForm] = useState({ teamId: '', soldPrice: '' });
    const [showConfetti, setShowConfetti] = useState(false);
    const [soldLog, setSoldLog] = useState<any[]>([]);
    const prevStatusRef = useRef<string | null>(null);

    // ========================================================================
    // POLLING
    // ========================================================================
    const fetchStatus = useCallback(async () => {
        if (!selectedCategoryId) return;
        try {
            const data = await auctionApi.getStatus(tournamentId, selectedCategoryId);
            setAuctionState(data);
            setError(null);

            // Trigger confetti when status changes to 'sold'
            if (data.auction.status === 'sold' && prevStatusRef.current !== 'sold') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3500);
            }
            prevStatusRef.current = data.auction.status;
        } catch (err: any) {
            // If auction doesn't exist yet, that's fine — just means not started
            if (err?.response?.status === 404) {
                setAuctionState(null);
                prevStatusRef.current = null;
            } else {
                setError(err?.response?.data?.message || 'Failed to fetch auction status');
            }
        }
    }, [tournamentId, selectedCategoryId]);

    useEffect(() => {
        if (!selectedCategoryId) {
            setAuctionState(null);
            return;
        }
        setLoading(true);
        fetchStatus().finally(() => setLoading(false));
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [selectedCategoryId, fetchStatus]);

    // Fetch sold log when category changes
    useEffect(() => {
        if (!selectedCategoryId) return;
        auctionApi.getSoldLog(tournamentId, selectedCategoryId)
            .then((data: any) => setSoldLog(data.logs || []))
            .catch(() => setSoldLog([]));
    }, [selectedCategoryId, tournamentId, auctionState?.auction?.logsCount]);

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const handleStartAuction = async () => {
        setActionLoading('start');
        setError(null);
        try {
            // Step 1: transition category status to auction_in_progress
            // (idempotent — backend ignores if already in that state)
            try {
                await API.post(`/categories/${selectedCategoryId}/start-auction`);
            } catch (categoryErr: any) {
                // Ignore if already started — backend throws BadRequestError
                const msg = categoryErr?.response?.data?.data?.message || '';
                if (!msg.toLowerCase().includes('already')) throw categoryErr;
            }
            // Step 2: create/resume the Auction document with player queue
            await auctionApi.start(tournamentId, selectedCategoryId);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || err?.response?.data?.message || 'Failed to start auction');
        }
        setActionLoading(null);
    };

    const handleSellPlayer = async () => {
        if (!sellForm.teamId || !sellForm.soldPrice) return;
        setActionLoading('sell');
        setError(null);
        try {
            await auctionApi.sell(tournamentId, selectedCategoryId, sellForm.teamId, Number(sellForm.soldPrice));
            setShowSellModal(false);
            setSellForm({ teamId: '', soldPrice: '' });
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || 'Failed to sell player');
        }
        setActionLoading(null);
    };

    const handleNext = async () => {
        setActionLoading('next');
        setError(null);
        try {
            await auctionApi.next(tournamentId, selectedCategoryId);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || 'Failed to move to next');
        }
        setActionLoading(null);
    };

    const handleSkip = async () => {
        setActionLoading('skip');
        setError(null);
        try {
            await auctionApi.skip(tournamentId, selectedCategoryId);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || 'Failed to skip');
        }
        setActionLoading(null);
    };

    const handleUndo = async () => {
        setActionLoading('undo');
        setError(null);
        try {
            await auctionApi.undo(tournamentId, selectedCategoryId);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || 'Failed to undo');
        }
        setActionLoading(null);
    };

    const handlePause = async () => {
        setActionLoading('pause');
        setError(null);
        try {
            await auctionApi.pause(tournamentId, selectedCategoryId);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.response?.data?.data?.message || 'Failed to pause/resume');
        }
        setActionLoading(null);
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    const auction = auctionState?.auction;
    const currentPlayer = auctionState?.currentPlayer;
    const teams = auctionState?.teams || [];
    const isActive = auction && ['in_progress', 'paused', 'sold'].includes(auction.status);

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <ConfettiOverlay show={showConfetti} />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Gavel className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Auction Control</h2>
                </div>

                {/* Category Selector */}
                <div className="relative">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="appearance-none bg-black/50 border border-white/10 text-white rounded-xl px-5 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-300 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
                </div>
            )}

            {/* No Category Selected */}
            {!selectedCategoryId && (
                <div className="p-10 text-center text-gray-500">
                    <Gavel className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select a category to manage its auction</p>
                </div>
            )}

            {/* Loading */}
            {selectedCategoryId && loading && (
                <div className="flex justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Auction Not Started */}
            {selectedCategoryId && !loading && !auctionState && (
                <div className="p-10 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Play className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white mb-2">Auction Not Started</p>
                        <p className="text-gray-400 text-sm max-w-md">Start the auction to begin assigning players from this category to teams. Make sure all players are approved first.</p>
                    </div>
                    <button
                        onClick={handleStartAuction}
                        disabled={actionLoading === 'start'}
                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {actionLoading === 'start' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gavel className="h-5 w-5" />}
                        Start Auction
                    </button>
                </div>
            )}

            {/* Auction Active */}
            {selectedCategoryId && !loading && auctionState && isActive && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT: Current Player + Controls */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Status Bar */}
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${auction!.status === 'paused'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                : auction!.status === 'sold'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${auction!.status === 'paused' ? 'bg-yellow-400' : auction!.status === 'sold' ? 'bg-green-400' : 'bg-blue-400 animate-pulse'}`} />
                                {auction!.status === 'sold' ? 'Player Sold!' : auction!.status === 'paused' ? 'Paused' : 'Live'}
                            </div>
                            <span className="text-gray-400 text-sm">
                                Player <span className="text-white font-bold">{auction!.currentPlayerIndex + 1}</span> / {auction!.totalPlayers}
                            </span>
                        </div>

                        {/* SOLD CELEBRATION */}
                        {auction!.status === 'sold' && auction!.lastSoldResult && (
                            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 border border-green-500/30 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                                <h3 className="text-5xl font-oswald font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">SOLD!</h3>
                                <p className="text-3xl font-bold text-white mb-2">{auction!.lastSoldResult.playerName}</p>
                                <p className="text-gray-400 text-lg mb-3">sold to</p>
                                <p className="text-4xl font-oswald font-black text-primary mb-4">{auction!.lastSoldResult.teamName}</p>
                                <div className="inline-block bg-green-600 px-6 py-2 rounded-full text-2xl font-mono font-bold text-white">
                                    ₹{auction!.lastSoldResult.soldPrice.toLocaleString()}
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleNext}
                                        disabled={!!actionLoading}
                                        className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'next' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SkipForward className="h-4 w-4" />}
                                        Next Player
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CURRENT PLAYER CARD */}
                        {auction!.status !== 'sold' && currentPlayer && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
                                {/* Avatar */}
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-primary/50 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-primary/10">
                                    {currentPlayer.profile.photo ? (
                                        <img src={currentPlayer.profile.photo} alt={`${currentPlayer.profile.firstName} ${currentPlayer.profile.lastName}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-6xl select-none">👤</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-center gap-4">
                                    <div>
                                        <h3 className="text-3xl font-oswald font-black text-white uppercase tracking-tight">
                                            {currentPlayer.profile.firstName} {currentPlayer.profile.lastName}
                                        </h3>
                                        <div className="h-1 w-16 bg-primary rounded-full mt-2" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Age</div>
                                            <div className="text-lg font-bold text-white">{currentPlayer.profile.age}</div>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Gender</div>
                                            <div className="text-lg font-bold text-white capitalize">{currentPlayer.profile.gender}</div>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-3">
                                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Base Price</div>
                                            <div className="text-lg font-bold text-primary font-mono">₹{currentPlayer.auctionData.basePrice.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {currentPlayer.profile.skillLevel && (
                                        <span className="inline-block w-fit text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest font-bold">
                                            {currentPlayer.profile.skillLevel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* WAITING STATE */}
                        {auction!.status !== 'sold' && !currentPlayer && (
                            <div className="p-10 text-center text-gray-500">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                                <p>Loading player...</p>
                            </div>
                        )}

                        {/* ACTION BUTTONS */}
                        {auction!.status !== 'sold' && currentPlayer && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => { setShowSellModal(true); setSellForm({ teamId: '', soldPrice: String(currentPlayer.auctionData.basePrice) }); }}
                                    disabled={!!actionLoading || auction!.status === 'paused'}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-green-600/20"
                                >
                                    <DollarSign className="h-4 w-4" /> Sell Player
                                </button>
                                <button
                                    onClick={handleSkip}
                                    disabled={!!actionLoading || auction!.status === 'paused'}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all disabled:opacity-50"
                                >
                                    {actionLoading === 'skip' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SkipForward className="h-4 w-4" />}
                                    Skip
                                </button>
                                <button
                                    onClick={handleUndo}
                                    disabled={!!actionLoading || auction!.logsCount === 0}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all disabled:opacity-50"
                                >
                                    {actionLoading === 'undo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                                    Undo
                                </button>
                                <button
                                    onClick={handlePause}
                                    disabled={!!actionLoading}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all disabled:opacity-50 ${auction!.status === 'paused'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-yellow-600/80 hover:bg-yellow-700 text-white'
                                        }`}
                                >
                                    {actionLoading === 'pause' ? <Loader2 className="h-4 w-4 animate-spin" /> : auction!.status === 'paused' ? <PlayCircle className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                    {auction!.status === 'paused' ? 'Resume' : 'Pause'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sold Log / Team Budgets */}
                    <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
                        {/* Team Budgets */}
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                            <h4 className="text-sm font-oswald font-bold text-gray-400 uppercase tracking-widest mb-3">Team Budgets</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {teams.map(team => (
                                    <div key={team._id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.primaryColor || '#64748b' }} />
                                            <span className="text-sm text-white font-medium truncate max-w-[120px]">{team.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold text-green-400">₹{team.budget.toLocaleString()}</div>
                                            <div className="text-[10px] text-gray-500">{team.playersCount} players</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sold Log */}
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex-1">
                            <h4 className="text-sm font-oswald font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Sold Log ({soldLog.length})
                            </h4>
                            {soldLog.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-4">No players sold yet</p>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {[...soldLog].reverse().map((log, i) => (
                                        <div key={log._id || i} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="text-sm text-white font-medium">{log.playerName}</p>
                                                <p className="text-xs text-gray-500">→ {log.teamName}</p>
                                            </div>
                                            <div className="text-sm font-mono font-bold text-primary">₹{log.finalPrice?.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETED STATE */}
            {selectedCategoryId && !loading && auction?.status === 'completed' && (
                <div className="p-8 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Trophy className="h-10 w-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-oswald font-bold text-white mb-2">Auction Complete!</h3>
                        <p className="text-gray-400">All {auction.totalPlayers} players have been processed.</p>
                    </div>
                    {/* Team Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
                        {teams.map(team => (
                            <div key={team._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.primaryColor || '#64748b' }} />
                                    <h4 className="font-bold text-white truncate">{team.name}</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Players</span>
                                        <span className="text-white font-bold">{team.playersCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Spent</span>
                                        <span className="text-primary font-mono font-bold">₹{team.totalSpent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Budget Left</span>
                                        <span className="text-green-400 font-mono font-bold">₹{team.budget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SELL MODAL */}
            {showSellModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
                        <button onClick={() => setShowSellModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-2xl font-oswald font-bold mb-2">Sell Player</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Assign <span className="text-white font-bold">{currentPlayer?.profile.firstName} {currentPlayer?.profile.lastName}</span> to a team
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Select Team *</label>
                                <select
                                    value={sellForm.teamId}
                                    onChange={(e) => setSellForm({ ...sellForm, teamId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="">Choose team...</option>
                                    {teams.map(team => (
                                        <option key={team._id} value={team._id}>
                                            {team.name} — ₹{team.budget.toLocaleString()} left
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Sold Price (₹) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={sellForm.soldPrice}
                                    onChange={(e) => setSellForm({ ...sellForm, soldPrice: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors font-mono text-lg"
                                    placeholder="Enter final bid amount"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowSellModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSellPlayer}
                                disabled={!sellForm.teamId || !sellForm.soldPrice || !!actionLoading}
                                className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === 'sell' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                Confirm Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AuctionSection;
