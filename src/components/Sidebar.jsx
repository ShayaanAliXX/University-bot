import React, { useState, useEffect } from 'react';
import { GraduationCap, PlusCircle, MessageSquare, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Participants removed as per request

const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            staggerChildren: 0.05
        }
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const Sidebar = ({
    isOpen,
    toggleSidebar,
    sessions = [],
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession
}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const shouldRender = isOpen || !isMobile;

    return (
        <>
            <AnimatePresence mode='wait'>
                {shouldRender && (
                    <motion.div
                        initial={isMobile ? "hidden" : false}
                        animate="visible"
                        exit={isMobile ? "exit" : undefined}
                        variants={isMobile ? sidebarVariants : undefined}
                        className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col shadow-2xl md:shadow-none
              md:relative md:translate-x-0
            `}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                <GraduationCap className="w-6 h-6 text-white" />
                            </motion.div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                                UniChat
                            </h1>
                        </div>
                        {/* Close Button for Mobile */}
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden absolute top-6 right-6 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* New Chat Button */}
                        <div className="p-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onNewChat}
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-100/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50 group"
                            >
                                <PlusCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span className="font-medium text-sm">New chat</span>
                            </motion.button>
                        </div>

                        {/* Recent Chats List */}
                        <div className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
                            <div className="mb-6">
                                <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                    Recent
                                </h3>
                                <div className="space-y-1">
                                    <AnimatePresence initial={false}>
                                        {sessions.map((session) => (
                                            <motion.div
                                                key={session.id}
                                                variants={itemVariants}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                onClick={() => onSelectSession(session.id)}
                                                className={`
                          group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 text-sm border
                          ${currentSessionId === session.id
                                                        ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30 shadow-sm'
                                                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent'
                                                    }
                        `}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden z-10 w-full">
                                                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-blue-500' : 'text-slate-400'}`} />
                                                    <span className="truncate block font-medium">
                                                        {session.title || "New Chat"}
                                                    </span>
                                                </div>

                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white dark:from-slate-800 dark:via-slate-800 to-transparent pl-4 py-1 z-20">
                                                    <button
                                                        onClick={(e) => onDeleteSession(e, session.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Delete chat"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {sessions.length === 0 && (
                                        <motion.p variants={itemVariants} className="px-3 text-xs text-slate-400 italic">No recent chats</motion.p>
                                    )}
                                </div>
                            </div>

                            {/* Drivers Section Removed */}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
                            <div className="text-[10px] font-medium text-slate-400 text-center uppercase tracking-widest opacity-50">
                                University Chatbot © 2026
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
