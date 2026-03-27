import React, { useEffect, useState } from 'react';
import { DollarSign, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getTournamentPayments } from '@/api/payment';

const statusColor = (status: string) => {
    switch (status) {
        case 'paid':    return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
        case 'failed':  return 'text-red-400 border-red-400/20 bg-red-400/10';
        case 'refunded': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
        default:        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
    }
};

export default function PaymentsSection({ tournamentId }: { tournamentId: string }) {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setIsLoading(true);
        getTournamentPayments(tournamentId)
            .then(data => setPayments(data || []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [tournamentId]);

    const filtered = payments.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.playerId?.toLowerCase().includes(q) ||
            p.razorpayOrderId?.toLowerCase().includes(q) ||
            p.razorpayPaymentId?.toLowerCase().includes(q) ||
            p.status?.toLowerCase().includes(q)
        );
    });

    const paidPayments = payments.filter(p => p.status === 'paid');
    const totalCollected = paidPayments.reduce((s, p) => s + (p.amount || 0), 0);

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Payments</h2>
                </div>

                {/* Stats summary */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                        <span className="text-lg font-bold font-oswald text-white">{paidPayments.length}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-oswald">Paid</span>
                    </div>
                    <div className="flex flex-col items-center bg-primary/10 border border-primary/30 rounded-xl px-4 py-2">
                        <span className="text-lg font-bold font-oswald text-primary">{totalCollected.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-oswald">Collected</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by player, order ID..."
                    className="bg-black/50 border-white/10 text-white pl-9"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center p-8 border border-white/5 rounded-xl bg-black/20">
                    <DollarSign className="h-10 w-10 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-400 font-medium">{payments.length === 0 ? 'No payments received yet.' : 'No matching payments.'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 uppercase text-xs tracking-wider border-b border-white/10">
                                <th className="pb-3 pr-4">Player ID</th>
                                <th className="pb-3 pr-4">Order ID</th>
                                <th className="pb-3 pr-4">Amount</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3 pr-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p: any) => (
                                <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 pr-4 text-gray-300 font-mono text-xs truncate max-w-[140px]" title={p.playerId}>
                                        {p.playerId}
                                    </td>
                                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs truncate max-w-[160px]" title={p.razorpayOrderId}>
                                        {p.razorpayOrderId}
                                    </td>
                                    <td className="py-3 pr-4 text-white font-bold font-mono">
                                        {p.amount?.toLocaleString()}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <Badge variant="outline" className={`px-2 py-0.5 text-[10px] uppercase font-bold ${statusColor(p.status)}`}>
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3 pr-4 text-gray-500 text-xs">
                                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
