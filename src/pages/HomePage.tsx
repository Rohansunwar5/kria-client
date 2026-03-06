import FeaturesSection from '@/components/FeaturesSection';
import HoverFooter from '../components/HoverFooter';
import ExploreKria from '@/components/ExploreKria';
import WhyChooseUs from '@/components/WhyChooseUs';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';

import SmoothScroll from '@/components/SmoothScroll';

const HomePage: React.FC = () => {
    return (
        <SmoothScroll>
            <div className="relative min-h-screen bg-black text-white font-montserrat overflow-x-hidden">
                <Navbar />
                <HeroSection />
                <WhyChooseUs />
                <ExploreKria />
                <FeaturesSection />
                <HoverFooter />
            </div>
        </SmoothScroll>
    );
};

export default HomePage;
