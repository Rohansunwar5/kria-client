import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    fetchRegistrationsByTournament,
    approveRegistration,
    rejectRegistration
} from '../../../store/slices/registrationSlice';
import { Users, Loader2, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface RegistrationsSectionProps {
    tournamentId: string;
}

const RegistrationsSection: React.FC<RegistrationsSectionProps> = ({ tournamentId }) => {
    const dispatch = useAppDispatch();
    const { tournamentRegistrations, isLoading, categories } = useAppSelector(state => state.registration);

    useEffect(() => {
        dispatch(fetchRegistrationsByTournament({ tournamentId }));
    }, [dispatch, tournamentId]);

    const handleApprove = async (id: string) => {
        await dispatch(approveRegistration(id));
    };

    const handleReject = async (id: string) => {
        await dispatch(rejectRegistration(id));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> Pending</span>;
            case 'approved': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Approved</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Rejected</span>;
            default: return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold uppercase tracking-wider w-fit">{status}</span>;
        }
    };

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="h-5 w-5" /></div>
                <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Player Applications</h2>
            </div>

            {isLoading && tournamentRegistrations.length === 0 ? (
                <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : tournamentRegistrations.length === 0 ? (
                <div className="text-center p-10 bg-black/20 rounded-2xl border border-white/5">
                    <ShieldAlert className="h-10 w-10 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-400">No applications received yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/40">
                                <th className="p-4 rounded-tl-xl text-xs font-bold text-gray-400 uppercase tracking-wider border-0">Player Name</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-0">Category</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-0">Gender / Age</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-0">Status</th>
                                <th className="p-4 rounded-tr-xl text-xs font-bold text-gray-400 uppercase tracking-wider text-right border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/20">
                            {tournamentRegistrations.map((reg: any) => (
                                <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <p className="text-white font-medium capitalize">{reg.profile?.firstName} {reg.profile?.lastName}</p>
                                        <p className="text-xs text-gray-500">{reg.profile?.phone}</p>
                                    </td>
                                    <td className="p-4 text-primary font-medium text-sm">
                                        {categories?.find((c: any) => c._id === reg.categoryId)?.name || reg.categoryDetails?.name || 'Unknown Category'}
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        <span className="capitalize font-medium">{reg.profile?.gender}</span>, {reg.profile?.age} yrs
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(reg.status)}
                                    </td>
                                    <td className="p-4 flex items-center justify-end gap-2">
                                        {reg.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(reg._id)}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors group"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(reg._id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors group"
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default RegistrationsSection;
