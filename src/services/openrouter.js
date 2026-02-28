
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const sendMessageToOpenRouter = async (userText, history = [], context = null, language = "English") => {
    if (!API_KEY) {
        console.error("OpenRouter API Key is missing");
        throw new Error("OpenRouter API Key is missing");
    }

    // Construct system message with context
    let systemContent = `You are a helpful university assistant. 
    
    IMPORTANT INSTRUCTIONS:
    1. **Language Support**: The user has selected **${language}**.
       - If ${language} is "Hindi", reply strictly in Hindi (Devanagari script).
       - If ${language} is "English", reply in English.
       - If they mix English and Hindi (Hinglish), and the selected language is Hindi, favor Hindi but you can be natural.
    2. **Thinking Process**: Before answering complex queries, briefly "think" about the answer. (You don't need to output the thinking process unless asked, but ensure your answer is well-reasoned).
    3. **Context**: Answer the user's questions based on the provided context if available.`;

    if (context) {
        systemContent += `\n\nContext:\n${context}`;
    }

    // Map history to OpenRouter format
    const messages = [
        { role: "system", content: systemContent },
        ...history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        })),
        { role: "user", content: userText }
    ];

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "University Chatbot"
            },
            body: JSON.stringify({
                // Using a free model for now as a safe default
                model: "google/gemini-2.0-flash-001",
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("OpenRouter Request Failed:", error);
        throw error; // Re-throw so App.jsx handles it
    }
};
