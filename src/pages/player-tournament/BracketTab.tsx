import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Trophy, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { Category } from '../../store/slices/registrationSlice';
import { Match } from '../../store/slices/matchSlice';
import API from '../../api/axios';

interface Props {
    categories: Category[];
    tournamentId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getC1(match: Match, cType: 'player' | 'team') {
    if (cType === 'player' && match.player1) {
        return { id: match.player1.registrationId, name: match.player1.name, teamName: match.player1.teamName, isTBD: match.player1.registrationId === 'TBD' };
    }
    return { id: match.teams?.team1Id || '', name: match.teams?.team1Name || 'TBD', teamName: '', isTBD: match.teams?.team1Name === 'TBD' };
}

function getC2(match: Match, cType: 'player' | 'team') {
    if (cType === 'player' && match.player2) {
        return { id: match.player2.registrationId, name: match.player2.name, teamName: match.player2.teamName, isTBD: match.player2.registrationId === 'TBD' };
    }
    return { id: match.teams?.team2Id || '', name: match.teams?.team2Name || 'TBD', teamName: '', isTBD: match.teams?.team2Name === 'TBD' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRACKET TAB
// ═══════════════════════════════════════════════════════════════════════════════

const BracketTab: React.FC<Props> = ({ categories, tournamentId }) => {
    const [selectedCat, setSelectedCat] = useState<string>(categories[0]?._id || '');
    const [matches, setMatches] = useState<Match[]>([]);
    const [rounds, setRounds] = useState<Record<string, Match[]>>({});
    const [competitorType, setCompetitorType] = useState<'player' | 'team'>('player');
    const [isLoading, setIsLoading] = useState(false);
    const [bracketType, setBracketType] = useState<string>('knockout');

    useEffect(() => {
        if (!selectedCat) return;
        const fetch = async () => {
            setIsLoading(true);
            try {
                const res = await API.get(`/matches/categories/${selectedCat}`);
                const payload = res.data?.data?.data || res.data?.data || {};
                setMatches(payload.matches || []);
                setRounds(payload.rounds || {});
                setCompetitorType(payload.competitorType || 'player');
                const cat = categories.find(c => c._id === selectedCat);
                setBracketType(cat?.bracketType || 'knockout');
            } catch {
                setMatches([]);
                setRounds({});
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [selectedCat, categories]);

    // Sort round names by roundNumber from the first match in each round
    const sortedRoundNames = Object.keys(rounds).sort((a, b) => {
        const aM = rounds[a]?.[0];
        const bM = rounds[b]?.[0];
        return ((aM as any)?.roundNumber || 0) - ((bM as any)?.roundNumber || 0);
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-2xl font-oswald font-bold tracking-wide">Bracket</h3>
                <div className="flex items-center gap-3">
                    {categories.length > 1 && (
                        <select
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-primary/30 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                            {categories.map(c => <option key={c._id} value={c._id} className="bg-[#111]">{c.name}</option>)}
                        </select>
                    )}
                    {matches.length > 0 && (
                        <Link
                            to={`/bracket/${tournamentId}/${selectedCat}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Full View
                        </Link>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : matches.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                    <Trophy className="h-10 w-10 opacity-30" />
                    <p>Bracket not generated yet. Check back after the auction completes.</p>
                </div>
            ) : bracketType === 'league' ? (
                <LeagueView matches={matches} competitorType={competitorType} />
            ) : (
                <KnockoutView sortedRoundNames={sortedRoundNames} rounds={rounds} competitorType={competitorType} />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOCKOUT VIEW (rounds sorted by roundNumber, byes hidden)
// ═══════════════════════════════════════════════════════════════════════════════

const KnockoutView: React.FC<{
    sortedRoundNames: string[];
    rounds: Record<string, Match[]>;
    competitorType: 'player' | 'team';
}> = ({ sortedRoundNames, rounds, competitorType }) => {
    return (
        <div className="overflow-x-auto no-scrollbar pb-4">
            <div className="flex gap-8 min-w-max">
                {sortedRoundNames.map((roundName, ri) => {
                    const roundMatches = rounds[roundName] || [];
                    // Hide bye matches
                    const visible = roundMatches.filter(m => !(m.status === 'walkover' && m.winReason === 'bye'));
                    if (visible.length === 0) return null;

                    return (
                        <div key={roundName} className="flex flex-col min-w-[300px]">
                            <div className="text-center mb-3">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">{roundName}</h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">{visible.length} match{visible.length !== 1 ? 'es' : ''}</p>
                            </div>
                            <div className="flex flex-col justify-around flex-1 gap-3" style={{ paddingTop: ri > 0 ? `${Math.pow(2, ri) * 16}px` : '0' }}>
                                {visible.map(match => (
                                    <MatchCard key={match._id} match={match} competitorType={competitorType} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MATCH CARD
// ═══════════════════════════════════════════════════════════════════════════════

const CompetitorSlot: React.FC<{
    name: string; teamName: string;
    isWinner: boolean; isTBD: boolean;
    score: number | null | undefined;
    competitorType: 'player' | 'team';
}> = ({ name, teamName, isWinner, isTBD, score, competitorType }) => (
    <div className={`flex items-center justify-between px-4 py-3 ${isWinner ? 'bg-emerald-500/5' : ''} ${isTBD ? 'opacity-40' : ''}`}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {isWinner && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            <div className="min-w-0">
                <span className={`font-semibold text-sm truncate block ${isWinner ? 'text-emerald-400' : isTBD ? 'text-gray-600 italic' : 'text-white'}`}>
                    {name}
                </span>
                {competitorType === 'player' && teamName && !isTBD && (
                    <span className="text-[10px] text-primary/70 font-medium mt-0.5 block truncate">{teamName}</span>
                )}
            </div>
        </div>
        {score !== null && score !== undefined && (
            <span className={`text-lg font-bold tabular-nums shrink-0 ml-3 ${isWinner ? 'text-emerald-400' : 'text-gray-400'}`}>{score}</span>
        )}
    </div>
);

const MatchCard: React.FC<{ match: Match; competitorType: 'player' | 'team' }> = ({ match, competitorType }) => {
    const c1 = getC1(match, competitorType);
    const c2 = getC2(match, competitorType);
    const isCompleted = match.status === 'completed' || match.status === 'walkover';

    return (
        <div className={`rounded-2xl border overflow-hidden ${isCompleted ? 'border-white/15 bg-white/[0.03]' : 'border-white/10 bg-white/5 hover:border-white/20'} transition-all`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <span className="text-[10px] text-gray-600 font-mono">M{match.matchNumber}</span>
                {isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 uppercase">Done</span>
                ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-gray-400 uppercase">Upcoming</span>
                )}
            </div>
            <CompetitorSlot name={c1.name} teamName={c1.teamName} isWinner={isCompleted && match.winnerId === c1.id} isTBD={c1.isTBD} score={match.result?.team1Total} competitorType={competitorType} />
            <div className="flex items-center px-4"><div className="flex-1 h-px bg-white/5" /><span className="px-2 text-[9px] text-gray-600 font-bold">VS</span><div className="flex-1 h-px bg-white/5" /></div>
            <CompetitorSlot name={c2.name} teamName={c2.teamName} isWinner={isCompleted && match.winnerId === c2.id} isTBD={c2.isTBD} score={match.result?.team2Total} competitorType={competitorType} />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEAGUE VIEW
// ═══════════════════════════════════════════════════════════════════════════════

const LeagueView: React.FC<{ matches: Match[]; competitorType: 'player' | 'team' }> = ({ matches, competitorType }) => {
    const standings: Record<string, { name: string; teamName: string; played: number; won: number; lost: number; points: number }> = {};

    matches.forEach(m => {
        const c1 = getC1(m, competitorType);
        const c2 = getC2(m, competitorType);
        if (!standings[c1.id]) standings[c1.id] = { name: c1.name, teamName: c1.teamName, played: 0, won: 0, lost: 0, points: 0 };
        if (!standings[c2.id]) standings[c2.id] = { name: c2.name, teamName: c2.teamName, played: 0, won: 0, lost: 0, points: 0 };

        if (m.status === 'completed') {
            standings[c1.id].played++;
            standings[c2.id].played++;
            if (m.winnerId === c1.id) { standings[c1.id].won++; standings[c1.id].points += 2; standings[c2.id].lost++; }
            else if (m.winnerId === c2.id) { standings[c2.id].won++; standings[c2.id].points += 2; standings[c1.id].lost++; }
        }
    });

    const sorted = Object.entries(standings).sort((a, b) => b[1].points - a[1].points || b[1].won - a[1].won);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">#</th>
                            <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">{competitorType === 'player' ? 'Player' : 'Team'}</th>
                            {competitorType === 'player' && <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Team</th>}
                            <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">P</th>
                            <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">W</th>
                            <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">L</th>
                            <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(([id, entry], idx) => (
                            <tr key={id} className="border-b border-white/5 hover:bg-white/[0.03]">
                                <td className="px-5 py-3 text-gray-500 font-bold">{idx + 1}</td>
                                <td className="px-5 py-3 text-white font-semibold">{entry.name}</td>
                                {competitorType === 'player' && <td className="px-5 py-3 text-primary/70 text-xs font-medium">{entry.teamName}</td>}
                                <td className="text-center px-3 py-3 text-gray-400">{entry.played}</td>
                                <td className="text-center px-3 py-3 text-emerald-400 font-bold">{entry.won}</td>
                                <td className="text-center px-3 py-3 text-red-400">{entry.lost}</td>
                                <td className="text-center px-3 py-3 text-primary font-bold">{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h4 className="text-lg font-oswald font-bold">All Fixtures</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map(m => {
                    const c1 = getC1(m, competitorType);
                    const c2 = getC2(m, competitorType);
                    return (
                        <div key={m._id} className={`flex flex-col px-5 py-4 rounded-2xl border ${m.status === 'completed' ? 'bg-white/[0.03] border-white/10' : 'bg-white/5 border-white/10 hover:border-white/20'} transition-all`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-semibold text-sm ${m.winnerId === c1.id ? 'text-emerald-400' : 'text-white'}`}>{c1.name}</span>
                                    {competitorType === 'player' && c1.teamName && <p className="text-[10px] text-primary/60 mt-0.5">{c1.teamName}</p>}
                                </div>
                                <div className="px-3 shrink-0">
                                    {m.status === 'completed' ? (
                                        <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">{m.result?.team1Total ?? '-'} : {m.result?.team2Total ?? '-'}</span>
                                    ) : (
                                        <span className="text-[10px] text-gray-600 uppercase font-bold">vs</span>
                                    )}
                                </div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-semibold text-sm ${m.winnerId === c2.id ? 'text-emerald-400' : 'text-white'}`}>{c2.name}</span>
                                    {competitorType === 'player' && c2.teamName && <p className="text-[10px] text-primary/60 mt-0.5">{c2.teamName}</p>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BracketTab;