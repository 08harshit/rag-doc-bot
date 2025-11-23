/**
 * Semantic Chunking - Split documents at topic boundaries using AI
 */

import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddings';

export async function createSemanticChunks(
    documents: Document[],
    options = { minChunkSize: 200, maxChunkSize: 1000, similarityThreshold: 0.75 }
): Promise<Document[]> {
    const embeddings = getEmbeddings();
    const result: Document[] = [];

    for (const doc of documents) {
        // Split into sentences
        const sentences = doc.pageContent.split(/[.!?]\s+/).filter(s => s.length > 10);
        if (!sentences.length) continue;

        // Get embeddings
        const vectors = await Promise.all(sentences.map(s => embeddings.embedQuery(s)));

        // Build chunks
        let chunk = [sentences[0]];
        let size = sentences[0].length;

        for (let i = 1; i < sentences.length; i++) {
            // Calculate similarity
            const dot = vectors[i].reduce((sum, v, j) => sum + v * vectors[i - 1][j], 0);
            const sim = dot / (Math.sqrt(vectors[i].reduce((s, v) => s + v * v, 0)) *
                Math.sqrt(vectors[i - 1].reduce((s, v) => s + v * v, 0)));

            // Check if we should start new chunk
            if ((sim < options.similarityThreshold && size >= options.minChunkSize) ||
                size + sentences[i].length > options.maxChunkSize) {
                result.push(new Document({
                    pageContent: chunk.join('. '),
                    metadata: doc.metadata
                }));
                chunk = [];
                size = 0;
            }

            chunk.push(sentences[i]);
            size += sentences[i].length;
        }

        // Add final chunk
        if (chunk.length) {
            result.push(new Document({
                pageContent: chunk.join('. '),
                metadata: doc.metadata
            }));
        }
    }

    return result;
}
