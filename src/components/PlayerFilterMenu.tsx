import React from 'react';
import { MapPin, Calendar, Search, ChevronDown, Dribbble } from 'lucide-react';

export const PlayerFilterMenu = () => {
    return (
        <div className="mt-16 w-full max-w-4xl bg-[#e5e5e5] rounded-full p-2 flex items-center shadow-2xl text-black">
            {/* Location */}
            <div className="flex-1 flex items-center gap-3 pl-8 pr-4 cursor-pointer hover:bg-black/5 rounded-l-full py-2 transition-colors">
                <MapPin className="h-5 w-5 text-black" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">Where</span>
                    <div className="flex items-center gap-1 text-xs text-black/60 font-medium">
                        <span>Bangalore</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                </div>
            </div>

            <div className="w-px h-10 bg-black/20"></div> {/* Separator */}

            {/* Sport */}
            <div className="flex-[1.2] flex items-center gap-3 px-6 cursor-pointer hover:bg-black/5 py-2 transition-colors">
                <Dribbble className="h-5 w-5 text-black" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">Select Sport</span>
                    <div className="flex items-center gap-1 text-xs text-black/60 font-medium">
                        <span>Select sport e.g. Cricket</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                </div>
            </div>

            <div className="w-px h-10 bg-black/20"></div> {/* Separator */}

            {/* Date */}
            <div className="flex-1 flex items-center gap-3 px-6 cursor-pointer hover:bg-black/5 py-2 transition-colors">
                <Calendar className="h-5 w-5 text-black" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">Choose Date</span>
                    <div className="flex items-center text-xs text-black/60 font-medium">
                        <span>Wed, Feb 18</span>
                    </div>
                </div>
            </div>

            {/* Search Button */}
            <button className="bg-primary hover:bg-primary/90 text-white p-4 mx-2 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-primary/30">
                <Search className="h-6 w-6" />
            </button>
        </div>
    );
};
