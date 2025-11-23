/**
 * Application Configuration
 * Validates and exports environment variables
 */

const requiredEnvVars = ['GEMINI_API_KEY'] as const;

// Validate environment variables at startup
function validateEnv(): void {
    const missing = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
}

validateEnv();

export const config = {
    gemini: {
        apiKey: process.env.GEMINI_API_KEY!,
        embeddingModel: 'text-embedding-004',
        chatModel: 'gemini-2.0-flash',
    },
    chroma: {
        url: process.env.CHROMA_URL || 'http://localhost:8000',
        collectionName: 'rag_docs_collection',
    },
    chunking: {
        chunkSize: 1000,
        chunkOverlap: 200,
    },
    retrieval: {
        topK: 4,
    },
} as const;
