const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const chalk = require('chalk').default; // Use .default

// Load environment variables
dotenv.config();

// --- Configuration ---
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("Error: Google API key not found.  Set the GOOGLE_API_KEY environment variable.");
    process.exit(1);
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// --- Choose a Gemini model ---
const MODEL_NAME = "gemini-2.0-pro-exp"; // Or another suitable model

// --- Function to List Available Models (for debugging) ---
async function listAvailableModels() {
    console.log(chalk.yellow.bold`Listing available models:`); // Template literal
    try {
        for await (const m of genAI.listModels()) {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(chalk.green`Model: ${m.name}`); // Template literal
                console.log(chalk.green`Display Name: ${m.displayName}`); // Template literal
                console.log(chalk.green`Supported Methods: ${m.supportedGenerationMethods}`); // Template literal
                console.log("-".repeat(20));
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

async function getLLMResponse(chat, prompt) {
    try {
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        if (error.message) {
            // Check for Safety Errors
            if (error.message.includes('blocked due to safety')) {
                return `Gemini API Error: ${error.message}. Prompt blocked due to safety settings.`;
            }
            return `Gemini API Error: ${error.message}`;
        } else {
            return `An unexpected error occurred: ${error.name}: ${error.message}`;
        }
    }
}

async function main() {
    console.log(chalk.white.bold`Terminal AI Assistant (Gemini API, Chat Mode) (Type 'exit' or 'quit' to end)`); // Template literal

    // --- Uncomment to list available models the FIRST time you run this ---
    // await listAvailableModels();

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 2048, // Adjust as needed
        },
    });

    const rl = readline.createInterface({ input, output });

    while (true) {
        try {
            const user_input = await rl.question(chalk.cyan.bold`You: `); // Template literal
            if (user_input.toLowerCase() === "exit" || user_input.toLowerCase() === "quit") {
                break;
            }

            const response = await getLLMResponse(chat, user_input);
            console.log(chalk.white.bold(response)); //Chained method works, but use literals

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log(chalk.yellow.bold`\nExiting...`); // Template literal
                break; // Exit the loop on AbortError
            }
            console.error(chalk.red.bold`An error occurred: ${error}`); // Template literal
        }
    }
    rl.close();
}

main();