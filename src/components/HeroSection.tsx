import React from 'react';
import heroImage from '../assets/hero-section.png';
import vectorImage from '../assets/vector1.png';

const HeroSection: React.FC = () => {
    return (
        <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-black">
            {/* Background Gradient only */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">

                {/* Text Content - Higher Z on Mobile */}
                <div className="flex flex-col space-y-6 max-w-2xl pt-20 relative z-30 items-start w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight tracking-tighter font-oswald uppercase whitespace-nowrap">
                            Unlock your Potential
                        </h1>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tighter font-oswald uppercase whitespace-nowrap">
                            Own the <span className="text-primary">Spotlight</span>
                        </h1>
                    </div>

                    <p className="text-gray-400 text-base md:text-xl font-montserrat max-w-xl leading-relaxed mt-4 text-left drop-shadow-md bg-black/30 md:bg-transparent p-2 md:p-0 rounded-md backdrop-blur-sm md:backdrop-blur-none">
                        Elevate your game with premium sports management and auction solutions. We bring the professional league experience to your local tournaments.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-8 justify-start">
                        <button className="px-8 py-4 bg-primary text-black font-bold rounded-lg hover:bg-black hover:text-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg font-oswald text-lg tracking-wider uppercase cursor-pointer border-2 border-primary">
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Visuals Column - Background on Mobile, Right Side on Desktop */}
                <div className="absolute inset-0 z-0 flex justify-center items-center md:static md:flex md:justify-end md:items-center md:h-full md:w-full">
                    {/* Decorative Elements - Centered on Mobile, Right on Desktop */}
                    <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] z-0 animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:right-0 md:left-auto md:translate-x-1/4 md:-translate-y-1/2"></div>

                    {/* Layered Images */}
                    <div className="relative w-full h-full flex justify-center items-center md:justify-end opacity-40 md:opacity-100">
                        {/* Vector Graphic - Lower Z-Index */}
                        <img
                            src={vectorImage}
                            alt="Sports Vector Graphic"
                            className="absolute z-10 w-[80%] md:w-[70%] h-auto max-h-screen object-contain md:right-0 md:translate-x-10 opacity-60 md:opacity-80"
                        />

                        {/* Athlete Image - Higher Z-Index */}
                        <img
                            src={heroImage}
                            alt="Athlete"
                            className="relative z-20 h-[70%] md:h-[85%] w-auto object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 md:right-10"
                        />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
