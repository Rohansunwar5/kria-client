import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auctionApi } from '../api/auction';
import { AuctionStatus, Player, Team } from '../types';
import SpinTheWheel from '../components/SpinTheWheel';

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const CONFETTI_COLORS = ['#F97316', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#fff'];

const ConfettiOverlay: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    return (
        <div className="confetti-container">
            {Array.from({ length: 80 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        animationDelay: `${Math.random() * 2.5}s`,
                        animationDuration: `${2.5 + Math.random() * 2}s`,
                        width: `${10 + Math.random() * 10}px`,
                        height: `${16 + Math.random() * 14}px`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AuctionDisplay: React.FC = () => {
    const { tournamentId, categoryId } = useParams<{ tournamentId: string; categoryId: string }>();
    const [status, setStatus] = useState<AuctionStatus | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [tournamentName, setTournamentName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [soldLog, setSoldLog] = useState<any[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const prevStatusRef = useRef<string | null>(null);

    // Poll every 2 seconds
    useEffect(() => {
        if (!tournamentId || !categoryId) return;

        const fetchData = async () => {
            try {
                const data = await auctionApi.getStatus(tournamentId, categoryId);
                setStatus(data.auction);
                setPlayer(data.currentPlayer);
                setTeams(data.teams);
                setTournamentName((data as any).tournament?.name || '');
                setCategoryName((data as any).category?.name || '');
                setLoading(false);

                // Confetti on sold
                if (data.auction.status === 'sold' && prevStatusRef.current !== 'sold') {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 4000);
                }
                prevStatusRef.current = data.auction.status;
            } catch (err) {
                console.error('Polling error', err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [tournamentId, categoryId]);

    // Fetch sold log
    useEffect(() => {
        if (!tournamentId || !categoryId) return;
        auctionApi.getSoldLog(tournamentId, categoryId)
            .then((data: any) => setSoldLog(data.logs || []))
            .catch(() => { });
    }, [tournamentId, categoryId, status?.logsCount]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!status) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500 text-2xl font-oswald font-bold">
            Auction Not Found
        </div>
    );

    // WAIT SCREEN
    if (status.status === 'not_started') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

                <h1 className="text-7xl md:text-8xl font-oswald font-extrabold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-500 to-primary drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] z-10 text-center uppercase">
                    {tournamentName || 'TOURNAMENT'}
                </h1>
                <h2 className="text-3xl md:text-4xl text-gray-300 font-montserrat font-light tracking-widest z-10 animate-pulse uppercase">
                    {categoryName ? `${categoryName} — ` : ''}Auction Starting Soon
                </h2>
                <div className="mt-12 flex items-center gap-3 text-primary z-10">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                    <span className="font-oswald text-xl uppercase tracking-widest">Waiting</span>
                </div>
            </div>
        );
    }

    // SOLD SCREEN (Celebration)
    if (status.status === 'sold' && status.lastSoldResult) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white relative overflow-hidden">
                <ConfettiOverlay show={showConfetti} />
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 to-[#0a0a0a] z-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

                <div className="z-10 text-center">
                    <h1 className="text-[10rem] font-oswald font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-2xl leading-none">
                        SOLD!
                    </h1>

                    <div className="bg-white/5 backdrop-blur-md p-10 md:p-12 rounded-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto">
                        <div className="text-5xl md:text-6xl font-oswald font-black mb-4 uppercase tracking-tight">{status.lastSoldResult.playerName}</div>
                        <div className="text-2xl text-gray-400 mb-4 font-montserrat font-light tracking-widest">Sold to</div>
                        <div className="text-6xl md:text-7xl font-oswald font-black tracking-wider drop-shadow-lg mb-6" style={{ color: status.lastSoldResult.teamColor || '#F97316' }}>
                            {status.lastSoldResult.teamName}
                        </div>
                        <div className="inline-block bg-green-600 px-8 py-3 rounded-full text-4xl md:text-5xl font-mono font-bold shadow-lg">
                            ₹{status.lastSoldResult.soldPrice.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // COMPLETED SCREEN
    if (status.status === 'completed') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-10 flex flex-col items-center font-montserrat">
                <h1 className="text-6xl md:text-7xl font-oswald font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-500 uppercase tracking-tight">
                    Auction Complete
                </h1>
                <p className="text-gray-400 text-xl mb-12 font-light">{tournamentName} — {categoryName}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {teams.map(team => (
                        <div key={team._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-colors">
                            <div className="h-2 w-full" style={{ backgroundColor: team.primaryColor || '#F97316' }} />
                            <div className="p-6 space-y-3">
                                <h3 className="text-2xl font-oswald font-bold">{team.name}</h3>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-gray-400">Spent</span>
                                    <span className="font-mono font-bold text-primary">₹{team.totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-gray-400">Budget Left</span>
                                    <span className="font-mono text-green-400 font-bold">₹{team.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Players</span>
                                    <span className="font-bold">{team.playersCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // MAIN AUCTION DISPLAY (Broadcast Style)
    return (
        <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col font-montserrat">
            <ConfettiOverlay show={showConfetti} />

            {/* TOP HEADER */}
            <div className="h-20 bg-gradient-to-r from-[#1a1a1a] to-[#111] flex items-center justify-between px-8 shadow-2xl z-20 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">🏸</span>
                    <h1 className="text-2xl font-oswald font-bold tracking-wider uppercase text-white/90">
                        {tournamentName || 'AUCTION'} <span className="text-primary">— {categoryName}</span>
                    </h1>
                </div>

                <div className="flex gap-6 text-sm font-oswald font-bold tracking-widest text-gray-400 uppercase">
                    <div>
                        Player <span className="text-white text-lg ml-1">{status.currentPlayerIndex + 1}</span> / {status.totalPlayers}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {status.status === 'paused' && (
                        <div className="animate-pulse bg-yellow-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            Paused
                        </div>
                    )}
                    <div className="text-red-500 font-bold flex items-center gap-2 font-oswald uppercase tracking-widest">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        Live
                    </div>
                </div>
            </div>

            {/* MAIN STAGE */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* BACKGROUND ACCENTS */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

                {/* LEFT: PLAYER VISUAL */}
                <div className="w-5/12 relative flex items-center justify-center p-12 z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-[100px] opacity-10 rounded-full" />
                        <div className="relative w-80 h-80 xl:w-96 xl:h-96 bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-full border-4 border-primary shadow-[0_0_50px_rgba(249,115,22,0.2)] flex items-center justify-center overflow-hidden">
                            {player?.profile.photo ? (
                                <img src={player.profile.photo} alt={`${player.profile.firstName} ${player.profile.lastName}`} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-9xl select-none filter drop-shadow-lg">👤</span>
                            )}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-white px-8 py-2 rounded-full font-oswald font-bold uppercase tracking-widest shadow-xl border border-primary/50 whitespace-nowrap text-sm">
                            {player?.profile.skillLevel || 'Player'}
                        </div>
                    </div>
                </div>

                {/* CENTER: PLAYER INFO / TIE-BREAKER */}
                <div className="w-4/12 flex flex-col justify-center z-10 pl-4">
                    {status.liveBid?.tieBreakerActive && status.liveBid?.tiedTeams && status.liveBid.tiedTeams.length >= 2 ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <SpinTheWheel
                                tiedTeams={status.liveBid.tiedTeams.map(id => {
                                    const t = teams.find(tm => tm._id === id);
                                    return { id, name: t?.name || 'Unknown', color: t?.primaryColor || '#64748b' };
                                })}
                                hardLimit={status.settings?.hardLimit || 0}
                                interactive={false}
                                externalWinnerId={status.liveBid?.spinWinnerId}
                                externalSpinStartedAt={status.liveBid?.spinStartedAt}
                            />
                        </div>
                    ) : player ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-6xl xl:text-7xl font-oswald font-black text-white uppercase leading-tight drop-shadow-xl tracking-tighter">
                                    {player.profile.firstName} {player.profile.lastName}
                                </h2>
                                <div className="h-1 w-32 bg-primary mt-4 rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl">
                                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-oswald">Age</div>
                                    <div className="text-2xl font-bold">{player.profile.age} Years</div>
                                </div>
                                <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl">
                                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-oswald">Gender</div>
                                    <div className="text-2xl font-bold capitalize">{player.profile.gender}</div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl inline-block">
                                <div className="text-primary text-xs uppercase tracking-widest mb-1 font-oswald font-bold">Base Price</div>
                                <div className="text-4xl font-mono font-black text-white">₹{player.auctionData.basePrice.toLocaleString()}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-3xl text-gray-600 italic font-light">Preparing next player...</div>
                    )}
                </div>

                {/* RIGHT: LIVE BID + BID HISTORY + SOLD LOG */}
                <div className="w-3/12 bg-[#111] border-l border-white/10 flex flex-col relative">
                    {/* LIVE BID */}
                    {status.liveBid && (status.status === 'in_progress' || status.status === 'paused') && (
                        <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="text-gray-500 text-[10px] uppercase tracking-widest font-oswald mb-2">Current Bid</div>
                            <div className="text-4xl font-mono font-black text-white mb-1">₹{(status.liveBid.currentPrice || 0).toLocaleString()}</div>
                            {status.liveBid.highestBidderName && (
                                <div className="text-sm text-gray-400">
                                    by <span className="text-primary font-bold">{status.liveBid.highestBidderName}</span>
                                </div>
                            )}
                            {status.settings?.hardLimit > 0 && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-[9px] text-gray-600 mb-0.5">
                                        <span>₹{player?.auctionData?.basePrice?.toLocaleString() || '0'}</span>
                                        <span className="text-red-400">₹{status.settings.hardLimit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (status.liveBid.currentPrice / status.settings.hardLimit) * 100)}%`,
                                                background: status.liveBid.currentPrice >= status.settings.hardLimit
                                                    ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                                                    : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                            }} />
                                    </div>
                                </div>
                            )}
                            {(status.liveBid.tiedTeams?.length || 0) >= 2 && (
                                <div className="mt-2 text-xs text-amber-400 font-bold animate-pulse">
                                    ⚡ {status.liveBid.tiedTeams.length} teams in tie-breaker!
                                </div>
                            )}
                        </div>
                    )}

                    {/* BID HISTORY */}
                    {status.liveBid?.bidHistory && status.liveBid.bidHistory.length > 0 && (
                        <div className="px-5 py-3 border-b border-white/10">
                            <h3 className="font-oswald font-bold text-[10px] uppercase tracking-widest text-gray-500 mb-2">Bid History</h3>
                            <div className="space-y-1 max-h-[160px] overflow-y-auto">
                                {[...status.liveBid.bidHistory].reverse().map((bid, i) => {
                                    const team = teams.find(t => t._id === bid.teamId);
                                    return (
                                        <div key={i} className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs ${i === 0 ? 'bg-primary/10 border border-primary/20' : ''}`}>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: team?.primaryColor || '#64748b' }} />
                                                <span className={`font-semibold ${i === 0 ? 'text-primary' : 'text-gray-300'}`}>{bid.teamName}</span>
                                            </div>
                                            <span className={`font-mono font-bold ${i === 0 ? 'text-white' : 'text-gray-500'}`}>₹{bid.amount.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SOLD LOG */}
                    <div className="px-5 py-4 border-b border-white/10">
                        <h3 className="font-oswald font-bold text-sm uppercase tracking-widest text-gray-400">Sold Players ({soldLog.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {soldLog.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-8">No players sold yet</p>
                        ) : (
                            [...soldLog].reverse().map((log, i) => (
                                <div key={log._id || i} className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-sm font-medium text-white">{log.playerName}</p>
                                        <p className="text-[11px] text-gray-500">→ {log.teamName}</p>
                                    </div>
                                    <div className="text-sm font-mono font-bold text-primary">₹{log.finalPrice?.toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Status indicator */}
                    {player && (
                        <div className="px-5 py-4 border-t border-white/10">
                            <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-oswald">Status</div>
                            <div className={`text-xl font-bold ${status.status === 'paused' ? 'text-yellow-400' : 'text-green-400 animate-pulse'}`}>
                                {status.status === 'paused' ? 'PAUSED' : 'OPEN FOR BIDS'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM TICKER - TEAMS */}
            <div className="h-24 bg-[#111] border-t border-white/10 flex items-center overflow-x-auto whitespace-nowrap px-4 scrollbar-hide">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                {teams.map(team => (
                    <div key={team._id} className="inline-flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl mx-2 border border-white/5 min-w-[280px]">
                        <div className="w-2 h-10 rounded" style={{ backgroundColor: team.primaryColor || '#F97316' }} />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-white truncate max-w-[140px]">{team.name}</div>
                            <div className="text-xs text-gray-500">{team.playersCount} Players</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-oswald">Purse Left</div>
                            <div className="text-lg font-mono font-bold text-green-400">₹{(team.budget / 100000).toFixed(2)}L</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuctionDisplay;
