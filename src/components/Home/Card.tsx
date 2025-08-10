import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

const Card: React.FC<CardProps> = ({ children, className = '', delay = 0 }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 hover:transform hover:-translate-y-2 animate-fade-in-up ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default Card;