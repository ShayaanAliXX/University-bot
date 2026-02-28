import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // We can't list models directly with the simpler SDK easily without a specific call usually found in admin parts or via REST. 
        // Actually the Node SDK usually doesn't expose listModels on the main client instance easily in older versions, 
        // but let's try the direct validation by making a simple generate call to test different names if we can't list.

        // Actually, asking the user to run a script is slow.
        // I will try to infer.

        // But wait, I can assume standard models.
        console.log("Testing models...");
    } catch (e) {
        console.error(e);
    }
}

// Better approach: just try to generate content with a few models and see which one works.
async function testModel(modelName) {
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`SUCCESS: ${modelName} works!`);
        return true;
    } catch (error) {
        console.log(`FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function main() {
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    for (const m of models) {
        if (await testModel(m)) {
            console.log(`\n>>> RECOMMENDED MODEL: ${m} <<<`);
            break;
        }
    }
}

main();
