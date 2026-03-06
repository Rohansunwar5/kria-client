import React from 'react';
import vector2 from '../assets/vector2.png';
import SectionHeader from './ui/SectionHeader';
import { Reveal } from './ui/Reveal';

const WhyChooseUs: React.FC = () => {
    return (
        <section id="about" className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden py-20">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left Column: Visuals - Overlapping on Mobile */}
                <div className="absolute top-24 left-0 w-full flex justify-start items-center pointer-events-none md:pointer-events-auto md:relative md:top-auto md:w-auto z-0 opacity-50 md:opacity-100">
                    {/* Decorative Blur */}
                    <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-primary/20 rounded-full blur-[80px] -z-10 animate-pulse top-1/2 left-0 transform -translate-y-1/2"></div>

                    <img
                        src={vector2}
                        alt="Why Choose Us Graphic"
                        className="w-[60%] md:w-[70%] h-auto object-contain drop-shadow-2xl animate-float -ml-4 md:-ml-12"
                    />
                </div>

                {/* Right Column: Content */}
                <div className="relative z-10 flex flex-col space-y-12 w-full">
                    <SectionHeader
                        title="Why Choose"
                        highlight="Kria?"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                        {/* Item 1 */}
                        <Reveal delay={0.1} className="flex flex-col space-y-2">
                            <span className="text-5xl md:text-6xl font-oswald text-primary font-bold">01</span>
                            <p className="text-gray-400 text-lg md:text-xl font-montserrat leading-tight max-w-[200px]">
                                Seamless event management
                            </p>
                        </Reveal>

                        {/* Item 2 */}
                        <Reveal delay={0.2} className="flex flex-col space-y-2">
                            <span className="text-5xl md:text-6xl font-oswald text-primary font-bold">02</span>
                            <p className="text-gray-400 text-lg md:text-xl font-montserrat leading-tight max-w-[200px]">
                                Secure sponsorships with ease
                            </p>
                        </Reveal>

                        {/* Item 3 */}
                        <Reveal delay={0.3} className="flex flex-col space-y-2">
                            <span className="text-5xl md:text-6xl font-oswald text-primary font-bold">03</span>
                            <p className="text-gray-400 text-lg md:text-xl font-montserrat leading-tight max-w-[200px]">
                                Get noticed by recruiters and brands
                            </p>
                        </Reveal>

                        {/* Item 4 */}
                        <Reveal delay={0.4} className="flex flex-col space-y-2">
                            <span className="text-5xl md:text-6xl font-oswald text-primary font-bold">04</span>
                            <p className="text-gray-400 text-lg md:text-xl font-montserrat leading-tight max-w-[200px]">
                                Track performance and career growth
                            </p>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
