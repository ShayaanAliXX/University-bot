import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { sendMessageToOpenRouter } from "./services/openrouter";
import { retrieveContext } from "./services/rag";

function App() {
  console.log("App rendering...");
  // --- STATE ---
  const [sessions, setSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chat_sessions');
        if (saved) return JSON.parse(saved);

        // Backward compatibility: check if we have old single history
        const oldHistory = localStorage.getItem('chat_history');
        if (oldHistory) {
          const messages = JSON.parse(oldHistory);
          if (messages.length > 0) {
            return [{
              id: Date.now().toString(),
              title: "Previous Chat",
              messages: messages,
              timestamp: Date.now()
            }];
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
    // Default: one empty session
    return [{
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      timestamp: Date.now()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    // If we have sessions, defaulting to the first one (most recent usually)
    // Note: We'll sort sessions by timestamp desc later, so first one is newest
    return null;
  });

  // Ensure we always have a selected session if sessions exist
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [language, setLanguage] = useState("English");

  // --- EFFECTS ---

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- HANDLERS ---

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const currentMessages = currentSession ? currentSession.messages : [];

  const createNewChat = () => {
    // Prevent creating a new chat if the current one is already empty
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession && currentSession.messages.length === 0) {
      // If on mobile, close sidebar even if we didn't create a new chat (UX polish)
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      return;
    }

    const newSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false); // Close mobile sidebar
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false); // Close mobile sidebar
  };

  const deleteSession = (e, id) => {
    e.stopPropagation(); // Prevent selecting the session when deleting
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== id);
      if (newSessions.length === 0) {
        // Always keep at least one session
        return [{
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          timestamp: Date.now()
        }];
      }
      return newSessions;
    });
    // If we deleted the current session, the useEffect will handle selecting another one
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userMessage = { role: "user", text: userText };
    setInput("");
    setIsLoading(true);

    // Optimistic update
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // If it's the first message, update title
        const newTitle = session.messages.length === 0
          ? userText.slice(0, 30) + (userText.length > 30 ? "..." : "")
          : session.title;

        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, userMessage],
          timestamp: Date.now() // Update timestamp to move to top
        };
      }
      return session;
    }));

    try {
      // 1. Retrieve RAG context
      const context = retrieveContext(userText);
      console.log("RAG Context:", context); // For debugging

      // 2. Send to Gemini with context (and history is handled by wrapper mostly, but wrapper now takes context)
      const responseText = await sendMessageToOpenRouter(userText, currentMessages, context, language);

      const botMessage = { role: "model", text: responseText };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, botMessage]
          };
        }
        return session;
      }));

    } catch (error) {
      console.error("Failed to send message", error);
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, { role: "model", text: "Sorry, something went wrong." }]
          };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <ChatArea
        messages={currentMessages}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        isThinking={isLoading}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        toggleSidebar={toggleSidebar}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
}

export default App;
