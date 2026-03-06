import React from 'react';
import { Calendar, Users, Trophy, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { Tournament } from '@/store/slices/tournamentSlice';

interface TournamentCardProps {
    tournament: Tournament;
    onClick?: () => void;
}

export function TournamentCard({ tournament, onClick }: TournamentCardProps) {
    const getStatusConfig = (status: Tournament['status']) => {
        switch (status) {
            case 'registration_open':
                return { label: 'Registration Open', className: 'bg-green-500/10 text-green-500 border-green-500/20' };
            case 'registration_closed':
                return { label: 'Registration Closed', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
            case 'ongoing':
                return { label: 'Ongoing', className: 'bg-primary/10 text-primary border-primary/20' };
            case 'upcoming':
                return { label: 'Upcoming', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
            case 'completed':
                return { label: 'Completed', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
            default:
                return { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
        }
    };

    const statusConfig = getStatusConfig(tournament.status as any);

    return (
        <div
            className="group relative w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 cursor-pointer flex flex-col"
            onClick={onClick}
        >
            {/* Image Section */}
            <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
                <img
                    src={tournament.bannerImage || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=3269&auto=format&fit=crop'}
                    alt={tournament.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                    <Badge variant="outline" className={cn("px-3 py-1 uppercase tracking-wider text-[10px] font-bold backdrop-blur-md", statusConfig.className)}>
                        {statusConfig.label}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-md border border-white/10">
                        {tournament.sport}
                    </Badge>
                </div>

                {/* Bottom Info inside Image */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2">
                    <h3 className="text-2xl font-oswald font-bold text-white tracking-wide line-clamp-2">
                        {tournament.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{tournament.venue?.city || 'TBD'}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col gap-5 relative bg-gradient-to-b from-transparent to-black/20 flex-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5 transition-colors group-hover:bg-primary/5 group-hover:border-primary/20">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white">{0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">Reg. Players</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5 transition-colors group-hover:bg-primary/5 group-hover:border-primary/20">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white">{0} / {tournament.settings?.maxTeams || '∞'}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">Teams</span>
                        </div>
                    </div>
                </div>

                {/* Dates Section */}
                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4 text-red-400/70" />
                            <span>Reg. Closes:</span>
                        </div>
                        <span className="text-red-400/90 font-medium">
                            {new Date(tournament.registrationDeadline).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="h-px w-full bg-white/10 my-1" />
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Calendar className="h-4 w-4" />
                            <span>Dates:</span>
                        </div>
                        <span className="text-white font-bold whitespace-nowrap">
                            {new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(tournament.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </div>

                {/* Hover overlay glow effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-b-3xl" />
            </div>
        </div>
    );
}
