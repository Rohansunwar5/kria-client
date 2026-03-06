import React from 'react';
import HoverFooter from '@/components/HoverFooter';
import { PlayerNavigation } from '@/components/PlayerNavigation';
import { PlayerFilterMenu } from '@/components/PlayerFilterMenu';
import { FeaturedTournaments } from '@/components/FeaturedTournaments';
import SmoothScroll from '@/components/SmoothScroll';

const PlayerHomePage = () => {
    return (
        <SmoothScroll>
            <div className="min-h-screen bg-[#111] text-white font-montserrat flex flex-col items-center">
                <PlayerNavigation />
                <PlayerFilterMenu />
                <FeaturedTournaments />
                <HoverFooter />
            </div>
        </SmoothScroll>
    );
};

export default PlayerHomePage;
