/**
 * Vector Store Service
 * Handles interactions with ChromaDB
 */

import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddings';
import { config } from './config';

/**
 * Create and populate a new vector store from documents
 */
export async function createVectorStore(
    documents: Document[]
): Promise<{ success: boolean; chunkCount: number }> {
    const embeddings = getEmbeddings();

    await Chroma.fromDocuments(documents, embeddings, {
        collectionName: config.chroma.collectionName,
        url: config.chroma.url,
    });

    return {
        success: true,
        chunkCount: documents.length,
    };
}

/**
 * Connect to an existing vector store
 */
export async function getVectorStore(): Promise<Chroma> {
    const embeddings = getEmbeddings();

    return await Chroma.fromExistingCollection(embeddings, {
        collectionName: config.chroma.collectionName,
        url: config.chroma.url,
    });
}

/**
 * Perform similarity search
 */
export async function searchDocuments(
    query: string,
    k: number = config.retrieval.topK,
    filter?: Record<string, any>
): Promise<Document[]> {
    const vectorStore = await getVectorStore();
    // Chroma supports filtering by metadata
    const retriever = vectorStore.asRetriever({
        k,
        filter: filter // Pass the filter to Chroma
    });
    return await retriever.invoke(query);
}
