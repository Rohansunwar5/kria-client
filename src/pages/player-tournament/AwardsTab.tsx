import React from 'react';
import { Trophy, Medal, Star, Shield, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    awards: any[];
}

const getIconForTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('mvp')) return <Star className="h-6 w-6 text-yellow-400" />;
    if (t.includes('defender')) return <Shield className="h-6 w-6 text-blue-400" />;
    if (t.includes('player of the tournament')) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (t.includes('emerging')) return <Star className="h-6 w-6 text-emerald-400" />;
    if (t.includes('attacker')) return <Award className="h-6 w-6 text-red-500" />;
    return <Medal className="h-6 w-6 text-purple-400" />;
};

export default function AwardsTab({ awards }: Props) {
    if (!awards || awards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in">
                <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center mb-6">
                    <Trophy className="h-10 w-10 text-gray-500 opacity-50" />
                </div>
                <h3 className="text-xl font-oswald font-bold text-white mb-2 tracking-wide">No Awards Yet</h3>
                <p className="text-gray-400 text-center max-w-md">
                    Awards are usually distributed after categories have concluded. Check back later to see the stars of the tournament!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {awards.map((award, index) => (
                <motion.div
                    key={award._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-black/60 to-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors"
                >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shrink-0">
                            {getIconForTitle(award.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-oswald font-bold text-white tracking-wide uppercase mb-1 truncate">
                                {award.title}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                {award.description || 'Recognized for outstanding performance during the tournament.'}
                            </p>
                            
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                    {award.player?.profile?.avatar ? (
                                        <img src={award.player.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400 uppercase">
                                            {(award.player?.profile?.firstName || award.player?.profile?.name || award.team?.name || '?')[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-medium truncate" title={award.player?.profile ? `${award.player.profile.firstName || ''} ${award.player.profile.lastName || ''}`.trim() || award.player.profile.name : award.team?.name}>
                                        {award.player?.profile 
                                            ? `${award.player.profile.firstName || ''} ${award.player.profile.lastName || ''}`.trim() || award.player.profile.name
                                            : award.team?.name || 'Unknown Recipient'}
                                    </p>
                                    <p className="text-xs text-purple-400 capitalize">
                                        {award.player ? (award.team ? `Player • ${award.team.name}` : 'Player Award') : 'Team Award'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
