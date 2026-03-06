import React, { useState } from 'react';
import { UserPlus, Plus, Trash2, Loader2, X, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addStaff, removeStaff } from '../../../store/slices/tournamentSlice';
import { Input } from '@/components/ui/input';

interface StaffSectionProps {
    tournamentId: string;
    staffIds: string[];
}

const StaffSection: React.FC<StaffSectionProps> = ({ tournamentId, staffIds }) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(state => state.tournament);

    const [isAdding, setIsAdding] = useState(false);
    const [newStaffId, setNewStaffId] = useState('');

    const handleAddStaff = async () => {
        if (!newStaffId.trim()) return;
        const result = await dispatch(addStaff({
            id: tournamentId,
            staffData: { staffId: newStaffId }
        }));
        if (addStaff.fulfilled.match(result)) {
            setIsAdding(false);
            setNewStaffId('');
        }
    };

    const handleRemoveStaff = async (staffId: string) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            await dispatch(removeStaff({ id: tournamentId, staffId }));
        }
    };

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Shield className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-oswald font-bold text-white tracking-wide">Tournament Staff ({staffIds?.length || 0})</h2>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary font-medium transition-colors text-sm">
                        <Plus className="h-4 w-4" /> Add Staff
                    </button>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="flex flex-col md:flex-row gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 items-start md:items-end">
                    <div className="flex-1 w-full space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Staff User ID</label>
                        <Input value={newStaffId} onChange={e => setNewStaffId(e.target.value)} placeholder="65a7d8e9f0..." className="bg-black/50 border-white/10 text-white" />
                        <p className="text-[10px] text-gray-500 ml-1">Enter the exact Organizer ID of the person you want to add as staff.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button onClick={() => setIsAdding(false)} className="flex-1 md:flex-none px-4 py-2 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                            <X className="h-4 w-4" />
                        </button>
                        <button onClick={handleAddStaff} disabled={isLoading || !newStaffId.trim()} className="flex-1 md:flex-none px-6 py-2 h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {!staffIds || staffIds.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No staff members assigned. Add one to help manage this tournament.</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {staffIds.map((staffId) => (
                        <div key={staffId} className="bg-black/30 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-primary font-bold">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">Staff Member</span>
                                    <span className="text-xs text-gray-500 font-mono">{staffId}</span>
                                </div>
                            </div>
                            <button onClick={() => handleRemoveStaff(staffId)} className="p-2 hover:bg-white/10 rounded-lg text-red-500 transition-colors" title="Remove Staff">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default StaffSection;
