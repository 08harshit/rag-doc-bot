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
        collectionName: 'rag_docs_v2', // Changed to force fresh start
    },
    chunking: {
        // Traditional character-based chunking (fallback)
        chunkSize: 1000,
        chunkOverlap: 200,

        // Semantic chunking options
        useSemantic: true, // Set to true to enable AI-powered semantic chunking
        semantic: {
            minChunkSize: 200,    // Minimum characters per chunk
            maxChunkSize: 1000,   // Maximum characters per chunk
            similarityThreshold: 0.75, // Similarity score to determine breaks (0-1)
            // Higher = fewer chunks (only break at major topic shifts)
            // Lower = more chunks (break at subtle topic changes)
        },
    },
    retrieval: {
        topK: 4,
    },
} as const;
