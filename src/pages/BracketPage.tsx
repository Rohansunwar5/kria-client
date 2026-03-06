import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Trophy, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Match } from '../store/slices/matchSlice';
import API from '../api/axios';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS - competitor extraction
// ═══════════════════════════════════════════════════════════════════════════════

function getC1(match: Match, cType: 'player' | 'team') {
    if (cType === 'player' && match.player1) {
        return { id: match.player1.registrationId, name: match.player1.name, teamName: match.player1.teamName, isTBD: match.player1.registrationId === 'TBD', isBye: match.player1.name === 'TBD' && match.player1.registrationId === 'TBD' };
    }
    return { id: match.teams?.team1Id || '', name: match.teams?.team1Name || 'TBD', teamName: '', isTBD: match.teams?.team1Name === 'TBD', isBye: match.teams?.team1Name === 'BYE' };
}

function getC2(match: Match, cType: 'player' | 'team') {
    if (cType === 'player' && match.player2) {
        return { id: match.player2.registrationId, name: match.player2.name, teamName: match.player2.teamName, isTBD: match.player2.registrationId === 'TBD', isBye: match.player2.name === 'TBD' && match.player2.registrationId === 'TBD' };
    }
    return { id: match.teams?.team2Id || '', name: match.teams?.team2Name || 'TBD', teamName: '', isTBD: match.teams?.team2Name === 'TBD', isBye: match.teams?.team2Name === 'BYE' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRACKET PAGE — Full-page dedicated bracket view
// ═══════════════════════════════════════════════════════════════════════════════

const BracketPage: React.FC = () => {
    const { tournamentId, categoryId } = useParams<{ tournamentId: string; categoryId: string }>();
    const [matches, setMatches] = useState<Match[]>([]);
    const [rounds, setRounds] = useState<Record<string, Match[]>>({});
    const [competitorType, setCompetitorType] = useState<'player' | 'team'>('player');
    const [isLoading, setIsLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        if (!categoryId) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await API.get(`/matches/categories/${categoryId}`);
                const payload = res.data?.data?.data || res.data?.data || {};
                setMatches(payload.matches || []);
                setRounds(payload.rounds || {});
                setCompetitorType(payload.competitorType || 'player');
            } catch {
                setMatches([]);
                setRounds({});
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [categoryId]);

    // Sort round names by round number from the matches
    const sortedRoundNames = Object.keys(rounds).sort((a, b) => {
        const aMatch = rounds[a]?.[0];
        const bMatch = rounds[b]?.[0];
        return ((aMatch as any)?.roundNumber || 0) - ((bMatch as any)?.roundNumber || 0);
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
            {/* Header */}
            <div className="max-w-[1800px] mx-auto mb-8">
                <Link
                    to={tournamentId ? `/player/tournament/${tournamentId}` : '/player/home'}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tournament
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Trophy className="h-6 w-6" /></div>
                    <div>
                        <h1 className="text-3xl font-oswald font-bold tracking-wide">Tournament Bracket</h1>
                        {categoryName && <p className="text-sm text-gray-400 mt-0.5">{categoryName}</p>}
                    </div>
                </div>
            </div>

            {/* Bracket content */}
            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            ) : matches.length === 0 ? (
                <div className="max-w-lg mx-auto bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                    <Trophy className="h-12 w-12 opacity-30" />
                    <p className="text-lg">Bracket not generated yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto no-scrollbar pb-8">
                    <div className="flex gap-6 min-w-max px-4">
                        {sortedRoundNames.map((roundName, ri) => {
                            const roundMatches = rounds[roundName] || [];
                            // Filter out bye matches for cleaner display
                            const visibleMatches = roundMatches.filter(m => {
                                const c1 = getC1(m, competitorType);
                                const c2 = getC2(m, competitorType);
                                // Hide matches where one side is TBD and it's a walkover (bye)
                                if (m.status === 'walkover' && m.winReason === 'bye') return false;
                                return true;
                            });

                            // If all matches in this round are byes, skip the round entirely
                            if (visibleMatches.length === 0) return null;

                            return (
                                <div key={roundName} className="flex flex-col min-w-[320px]">
                                    <div className="text-center mb-4 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{roundName}</h3>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{visibleMatches.length} match{visibleMatches.length !== 1 ? 'es' : ''}</p>
                                    </div>
                                    <div
                                        className="flex flex-col justify-around flex-1 gap-3"
                                        style={{ paddingTop: ri > 0 ? `${Math.pow(2, ri) * 12}px` : '0' }}
                                    >
                                        {visibleMatches.map(match => (
                                            <BracketMatchCard key={match._id} match={match} competitorType={competitorType} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BRACKET MATCH CARD
// ═══════════════════════════════════════════════════════════════════════════════

const BracketMatchCard: React.FC<{ match: Match; competitorType: 'player' | 'team' }> = ({ match, competitorType }) => {
    const c1 = getC1(match, competitorType);
    const c2 = getC2(match, competitorType);
    const isCompleted = match.status === 'completed' || match.status === 'walkover';
    const isC1Winner = isCompleted && match.winnerId === c1.id;
    const isC2Winner = isCompleted && match.winnerId === c2.id;

    return (
        <div className={`rounded-xl border overflow-hidden transition-all min-w-[300px] ${isCompleted ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/10 bg-white/[0.03]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                <span className="text-[10px] text-gray-600 font-mono">M{match.matchNumber}</span>
                {isCompleted ? (
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Done
                    </span>
                ) : (c1.isTBD || c2.isTBD) ? (
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Pending</span>
                ) : (
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Upcoming</span>
                )}
            </div>

            {/* Competitor 1 */}
            <CompetitorRow
                name={c1.name} teamName={c1.teamName}
                isWinner={isC1Winner} isTBD={c1.isTBD} isBye={c1.isBye}
                score={match.result?.team1Total}
                competitorType={competitorType}
            />

            <div className="h-px bg-white/5" />

            {/* Competitor 2 */}
            <CompetitorRow
                name={c2.name} teamName={c2.teamName}
                isWinner={isC2Winner} isTBD={c2.isTBD} isBye={c2.isBye}
                score={match.result?.team2Total}
                competitorType={competitorType}
            />
        </div>
    );
};

const CompetitorRow: React.FC<{
    name: string; teamName: string;
    isWinner: boolean; isTBD: boolean; isBye: boolean;
    score: number | null | undefined;
    competitorType: 'player' | 'team';
}> = ({ name, teamName, isWinner, isTBD, isBye, score, competitorType }) => {
    return (
        <div className={`flex items-center justify-between px-3 py-2.5 ${isWinner ? 'bg-emerald-500/5' : ''} ${isTBD || isBye ? 'opacity-30' : ''}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {isWinner && <div className="w-1 h-4 bg-emerald-400 rounded-full shrink-0" />}
                <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isWinner ? 'text-emerald-400' : isTBD ? 'text-gray-600 italic' : 'text-white'}`}>
                        {name}
                    </p>
                    {competitorType === 'player' && teamName && !isTBD && !isBye && (
                        <p className="text-[10px] text-primary/60 truncate">{teamName}</p>
                    )}
                </div>
            </div>
            {score !== null && score !== undefined && (
                <span className={`text-base font-bold tabular-nums ml-2 shrink-0 ${isWinner ? 'text-emerald-400' : 'text-gray-500'}`}>{score}</span>
            )}
        </div>
    );
};

export default BracketPage;
