'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChatInterface } from './ChatInterface';
import { AdminView } from './AdminView';
import { CallReviewsView } from './CallReviewsView';
import { ClientDataView } from './ClientDataView';
import { AgencyChatView } from './AgencyChatView';

export type WorkspaceView = 'chat' | 'reviews' | 'client-data' | 'admin' | 'agency';

interface WorkspaceViewsProps {
    activeView: WorkspaceView;
}

const variants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -4 },
};

const transition = { duration: 0.18, ease: 'easeOut' as const };


export function WorkspaceViews({ activeView }: WorkspaceViewsProps) {
    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">

                {activeView === 'chat' && (
                    <motion.div
                        key="chat"
                        className="absolute inset-0"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <ChatInterface />
                    </motion.div>
                )}

                {activeView === 'reviews' && (
                    <motion.div
                        key="reviews"
                        className="absolute inset-0"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <CallReviewsView />
                    </motion.div>
                )}

                {activeView === 'client-data' && (
                    <motion.div
                        key="client-data"
                        className="absolute inset-0"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <ClientDataView />
                    </motion.div>
                )}

                {activeView === 'admin' && (
                    <motion.div
                        key="admin"
                        className="absolute inset-0 overflow-y-auto"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <AdminView />
                    </motion.div>
                )}

                {activeView === 'agency' && (
                    <motion.div
                        key="agency"
                        className="absolute inset-0"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <AgencyChatView />
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
