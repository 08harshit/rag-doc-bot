/**
 * Embedding Service
 * Handles text embedding generation
 */

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { config } from './config';

let embeddingsInstance: GoogleGenerativeAIEmbeddings | null = null;

/**
 * Get or create embeddings instance (singleton pattern)
 */
export function getEmbeddings(): GoogleGenerativeAIEmbeddings {
    if (!embeddingsInstance) {
        embeddingsInstance = new GoogleGenerativeAIEmbeddings({
            apiKey: config.gemini.apiKey,
            modelName: config.gemini.embeddingModel,
        });
    }
    return embeddingsInstance;
}
