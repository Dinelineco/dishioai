'use client';

import { motion } from 'framer-motion';
import { Calendar, ExternalLink } from 'lucide-react';

const OPENTABLE_URL = 'https://www.opentable.com/booking/restref/availability?lang=en-US&correlationId=81924113-fdaa-4f58-b0e9-a7706eb8fb2d&restRef=1389850&otSource=Restaurant%20website';

export default function StickyBookButton() {
    return (
        <motion.a
            href={OPENTABLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="fixed bottom-6 right-6 z-50 group"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-rebellion-red hover:bg-rebellion-red/90 text-white px-8 py-4 rounded-full font-display text-lg shadow-2xl flex items-center gap-3 transition-all duration-300"
                animate={{
                    boxShadow: [
                        '0 0 20px rgba(196, 30, 58, 0.5)',
                        '0 0 40px rgba(196, 30, 58, 0.8)',
                        '0 0 20px rgba(196, 30, 58, 0.5)',
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <Calendar className="w-5 h-5" />
                Book Now
                <ExternalLink className="w-4 h-4 opacity-70" />
            </motion.button>
        </motion.a>
    );
}
