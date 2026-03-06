import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    title: string;
    highlight?: string;
    subtitle?: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    highlight,
    subtitle,
    className,
    align = 'left'
}) => {
    return (
        <div className={cn(
            "flex flex-col mb-12",
            align === 'center' ? 'items-center text-center' :
                align === 'right' ? 'items-end text-right' : 'items-start text-left',
            className
        )}>
            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold font-oswald text-white uppercase tracking-tight leading-tight"
            >
                {title} {highlight && <span className="text-primary">{highlight}</span>}
            </motion.h2>

            {/* Subtitle / Decoration */}
            {subtitle && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    whileInView={{ opacity: 1, width: "100px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="mt-4 flex flex-col gap-2"
                >
                    <span className="h-1 bg-primary rounded-full"></span>
                    <p className="text-gray-400 font-montserrat text-sm md:text-base uppercase tracking-widest">
                        {subtitle}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default SectionHeader;
