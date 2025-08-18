import React from 'react';

interface HeroProps {
    title: string;
    description: string;
}

const Hero: React.FC<HeroProps> = ({ title, description }) => {
    return (
        <div className="pt-32 pb-16 bg-gradient-to-br from-[#7c393e] via-[#7c393e]/95 to-[#8b4346]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                    <div className="w-24 h-1 bg-[#c68f4f] mx-auto mb-6"></div>
                    <p className="text-xl max-w-3xl mx-auto">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
