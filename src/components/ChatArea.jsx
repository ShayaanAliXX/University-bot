import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, Moon, Sun, Menu, ArrowUp, Mic, MicOff, Volume2, StopCircle, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Dark theme for code blocks

const ChatArea = ({
    messages,
    input,
    setInput,
    onSend,
    isLoading,
    isDarkMode,
    toggleTheme,
    toggleSidebar,

    isThinking,
    language,
    setLanguage
}) => {
    const messagesEndRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);

    const recognitionRef = useRef(null); // Ref to store recognition instance

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? " " : "") + transcript);
            };

            recognitionRef.current = recognition; // Store instance
            recognition.start();
        } else {
            alert("Speech recognition is not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop(); // Stop the actual instance
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    // --- Voice Output (TTS) ---
    const speakMessage = (text, id) => {
        if ('speechSynthesis' in window) {
            // Cancel any current speech
            window.speechSynthesis.cancel();

            if (speakingMessageId === id) {
                // If clicking same button, just stop
                setSpeakingMessageId(null);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);

            // Try to set a Hindi voice if the text looks Hindi-ish or just default
            // For now, let's just use default and maybe search for a better one
            const voices = window.speechSynthesis.getVoices();
            // Optional: logic to pick a specific voice if desired

            utterance.onend = () => setSpeakingMessageId(null);

            setSpeakingMessageId(id);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Text-to-speech is not supported in this browser.");
        }
    };

    // cleanup speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full relative bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-3xl transition-colors duration-300">

            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="h-16 px-6 border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20 transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                            University Assistant
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles className="w-4 h-4 text-blue-500" />
                            </motion.div>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${isLangOpen
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            {language}
                        </motion.button>

                        <AnimatePresence>
                            {isLangOpen && (
                                <>
                                    {/* Backdrop to close when clicking outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsLangOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 origin-top-right"
                                    >
                                        {['English', 'Hindi'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => {
                                                    setLanguage(lang);
                                                    setIsLangOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${language === lang ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-blue-400 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-md transition-all"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth z-10 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400"
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20"
                            >
                                <Bot className="w-12 h-12 text-white" />
                            </motion.div>
                            <motion.h3
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
                            >
                                How can I help you?
                            </motion.h3>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="max-w-md text-base leading-relaxed text-slate-400"
                            >
                                I'm here to assist with course details, campus events, library hours, and more.
                            </motion.p>
                        </motion.div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: msg.role === "user" ? 50 : -50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""
                                }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user"
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                                    }`}
                            >
                                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div
                                className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl shadow-sm relative ${msg.role === "user"
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                                    : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-200 border border-white/20 dark:border-slate-700/50 rounded-tl-sm shadow-md"
                                    }`}
                            >
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                {msg.role !== "user" && (
                                    <button
                                        onClick={() => speakMessage(msg.text, idx)}
                                        className="absolute -bottom-6 left-2 p-1.5 text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
                                        title="Read aloud"
                                    >
                                        {speakingMessageId === idx ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Thinking / Loading Indicator */}
                    {(isLoading || isThinking) && (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl rounded-tl-sm border border-white/20 dark:border-slate-700/50 shadow-md">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                                        Thinking...
                                    </span>
                                    <div className="flex space-x-1">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                            className="w-2 h-2 bg-blue-500 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                            className="w-2 h-2 bg-indigo-500 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                            className="w-2 h-2 bg-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 z-20">
                <div className="max-w-4xl mx-auto relative flex items-center gap-3 p-2 pl-4 bg-slate-100 dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all shadow-inner">

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Listening..." : "Ask something..."}
                        disabled={isLoading || isListening}
                        rows={1}
                        className={`flex-1 bg-transparent text-slate-900 dark:text-white border-0 px-5 py-3.5 focus:ring-0 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 resize-none min-h-[50px] max-h-[150px] self-center ${isListening ? 'animate-pulse text-red-500 dark:text-red-400 font-medium' : ''
                            }`}
                        style={{ height: "auto" }}
                    />

                    {/* Mic Button - Sound Wave Effect */}
                    <div className="flex items-center gap-2 pr-1">
                        <AnimatePresence mode="wait">
                            {isListening ? (
                                <motion.div
                                    key="recording"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="flex items-center gap-1 bg-red-500/10 p-2 rounded-full mr-1"
                                    onClick={stopListening}
                                >
                                    <div className="flex items-center gap-0.5 h-8 px-2">
                                        {[1, 2, 3, 4, 5].map((bar) => (
                                            <motion.div
                                                key={bar}
                                                animate={{ height: [8, 24, 8] }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    delay: bar * 0.1,
                                                    ease: "easeInOut"
                                                }}
                                                className="w-1 bg-red-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <MicOff className="w-5 h-5 text-red-500 cursor-pointer" />
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="idle"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startListening}
                                    className="p-3 text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
                                >
                                    <Mic className="w-5 h-5" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={onSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <ArrowUp className="w-5 h-5" strokeWidth={3} />
                            )}
                        </motion.button>
                    </div>
                </div>
                <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-3 opacity-70">
                    Powered by Gemini AI • Responses may be inaccurate
                </p>
            </div>
        </div >
    );
};

export default ChatArea;
