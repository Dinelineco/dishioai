'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface MenuCardProps {
    title: string;
    description: string;
    price: string;
    image?: string;
    delay?: number;
}

export default function MenuCard({ title, description, price, image, delay = 0 }: MenuCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="group relative overflow-hidden rounded-lg bg-charcoal/50 backdrop-blur-sm border border-rebellion-red/20 hover:border-rebellion-red/60 transition-all duration-500"
        >
            {image && (
                <div className="relative h-64 overflow-hidden">
                    <motion.img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/50 to-transparent opacity-80" />
                </div>
            )}

            <div className="p-6">
                <h3 className="font-display text-2xl text-white mb-3 group-hover:text-saffron-gold transition-colors duration-300">
                    {title}
                </h3>
                <p className="font-serif text-gray-300 mb-4 leading-relaxed">
                    {description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-saffron-gold font-display text-3xl">{price}</span>
                </div>
            </div>
        </motion.div>
    );
}
