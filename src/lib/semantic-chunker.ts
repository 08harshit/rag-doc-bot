/**
 * Semantic Chunking - Split documents at topic boundaries using AI
 */

import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddings';

export async function createSemanticChunks(
    documents: Document[],
    options = { minChunkSize: 200, maxChunkSize: 1000, similarityThreshold: 0.75 }
): Promise<Document[]> {
    console.log('🧠 SEMANTIC CHUNKING STARTED');
    console.log(`   Settings: min=${options.minChunkSize}, max=${options.maxChunkSize}, threshold=${options.similarityThreshold}`);

    const embeddings = getEmbeddings();
    const result: Document[] = [];

    for (const doc of documents) {
        // Split into sentences
        const sentences = doc.pageContent.split(/[.!?]\s+/).filter(s => s.length > 10);
        if (!sentences.length) continue;

        console.log(`\n📄 Processing: ${doc.metadata.source || 'document'}`);
        console.log(`   Total sentences: ${sentences.length}`);

        // Get embeddings
        console.log('   ⚡ Generating embeddings for all sentences...');
        const vectors = await Promise.all(sentences.map(s => embeddings.embedQuery(s)));
        console.log('   ✅ Embeddings generated');

        // Build chunks
        let chunk = [sentences[0]];
        let size = sentences[0].length;
        let chunkCount = 0;

        for (let i = 1; i < sentences.length; i++) {
            // Calculate similarity
            const dot = vectors[i].reduce((sum, v, j) => sum + v * vectors[i - 1][j], 0);
            const sim = dot / (Math.sqrt(vectors[i].reduce((s, v) => s + v * v, 0)) *
                Math.sqrt(vectors[i - 1].reduce((s, v) => s + v * v, 0)));

            // Check if we should start new chunk
            const wouldExceed = size + sentences[i].length > options.maxChunkSize;
            const isTopicChange = sim < options.similarityThreshold && size >= options.minChunkSize;

            if (isTopicChange || wouldExceed) {
                chunkCount++;
                const reason = isTopicChange ? `topic change (sim: ${sim.toFixed(3)})` : `size limit (${size} chars)`;
                console.log(`   ✂️  Chunk #${chunkCount} created: ${chunk.length} sentences, ${size} chars - ${reason}`);

                result.push(new Document({
                    pageContent: chunk.join('. '),
                    metadata: {
                        ...doc.metadata,
                        chunkType: 'semantic',
                        chunkMethod: 'ai-similarity',
                        chunkIndex: chunkCount - 1,
                    }
                }));
                chunk = [];
                size = 0;
            }

            chunk.push(sentences[i]);
            size += sentences[i].length;
        }

        // Add final chunk
        if (chunk.length) {
            chunkCount++;
            console.log(`   ✂️  Chunk #${chunkCount} created: ${chunk.length} sentences, ${size} chars - final chunk`);
            result.push(new Document({
                pageContent: chunk.join('. '),
                metadata: {
                    ...doc.metadata,
                    chunkType: 'semantic',
                    chunkMethod: 'ai-similarity',
                    chunkIndex: chunkCount - 1,
                }
            }));
        }

        console.log(`   ✅ Total chunks created: ${chunkCount}`);
    }

    console.log(`\n🎯 SEMANTIC CHUNKING COMPLETE`);
    console.log(`   Total chunks across all documents: ${result.length}\n`);
    return result;
}
