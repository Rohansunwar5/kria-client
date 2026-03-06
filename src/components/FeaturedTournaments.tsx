import React, { useEffect } from 'react';
import { TournamentCard } from '@/components/TournamentCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicTournaments } from '@/store/slices/tournamentSlice';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const FeaturedTournaments = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { publicTournaments, isLoading } = useAppSelector((state) => state.tournament);

    useEffect(() => {
        // Fetch upcoming, registration open, and ongoing tournaments
        dispatch(fetchPublicTournaments({ limit: 6 }));
    }, [dispatch]);

    return (
        <div className="w-full max-w-7xl px-8 mt-24 mb-32 flex flex-col gap-10 min-h-[400px]">
            <div className="flex items-end justify-between w-full">
                <div>
                    <h2 className="text-4xl font-oswald font-bold tracking-wide text-white uppercase flex items-center gap-3">
                        Featured Tournaments
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl leading-relaxed">
                        Discover and join the most anticipated sports events in your city. From casual leagues to professional championships, find your next challenge here.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            ) : publicTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publicTournaments.map((tournament) => (
                        <TournamentCard
                            key={tournament._id}
                            tournament={tournament}
                            onClick={() => navigate(`/player/tournament/${tournament._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/10 p-10">
                    <p className="text-lg">No featured tournaments available at the moment.</p>
                </div>
            )}
        </div>
    );
};
