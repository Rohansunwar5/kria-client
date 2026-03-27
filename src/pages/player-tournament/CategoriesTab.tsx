import React from 'react';
import { Dribbble, CheckCircle2, Loader2 } from 'lucide-react';
import { Category, Registration } from '../../store/slices/registrationSlice';

interface Props {
    categories: Category[];
    myRegistrations: Registration[];
    tournamentStatus: string;
    isRegLoading: boolean;
    registeringCategoryId: string | null;
    onRegister: (categoryId: string) => void;
}

const CategoriesTab: React.FC<Props> = ({ categories, myRegistrations, tournamentStatus, isRegLoading, registeringCategoryId, onRegister }) => {
    const hasRegistered = (categoryId: string) => myRegistrations.some(r => r.categoryId === categoryId);

    if (categories.length === 0) return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-400">
            No categories have been announced for this tournament yet.
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-oswald font-bold tracking-wide mb-2">Registration Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(category => {
                    const isRegistered = hasRegistered(category._id);
                    return (
                        <div key={category._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl font-bold font-oswald tracking-wide text-white">{category.name}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                                </div>
                                <div className="bg-primary/10 text-primary p-2 rounded-xl">
                                    <Dribbble className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Format</span>
                                    <span className="font-medium text-white capitalize">{category.bracketType?.replace('_', ' ') || 'TBD'}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Gender</span>
                                    <span className="font-medium text-white">{category.gender}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Max Participants</span>
                                    <span className="font-medium text-white">{category.maxRegistrations || 'Unlimited'}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-xl">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">Reg. Fee</span>
                                    <span className={`font-medium ${category.isPaidRegistration ? 'text-primary' : 'text-emerald-400'}`}>
                                        {category.isPaidRegistration ? `₹${category.registrationFee}` : 'Free'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                {isRegistered ? (
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium w-full justify-center bg-emerald-400/10 py-2.5 rounded-xl border border-emerald-400/20">
                                        <CheckCircle2 className="h-5 w-5" /> Registered
                                    </div>
                                ) : tournamentStatus === 'registration_open' ? (
                                    <button
                                        onClick={() => onRegister(category._id)}
                                        disabled={isRegLoading || registeringCategoryId === category._id}
                                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {registeringCategoryId === category._id && isRegLoading
                                            ? <Loader2 className="h-5 w-5 animate-spin" />
                                            : category.isPaidRegistration ? `Pay ₹${category.registrationFee}+ & Register` : 'Register Now'}
                                    </button>
                                ) : (
                                    <button disabled className="w-full py-2.5 bg-gray-500/20 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                        Registration Closed
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoriesTab;
