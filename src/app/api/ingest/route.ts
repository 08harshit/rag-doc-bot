/**
 * Document Ingestion API Route
 * POST /api/ingest - Ingest and index documents from the docs directory
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as path from 'path';
import { loadDocuments } from '@/lib/document-loader';
import { createVectorStore } from '@/lib/vectorstore';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        // 1. Load documents
        const rawDocs = await loadDocuments(docsDir);

        if (rawDocs.length === 0) {
            return NextResponse.json(
                { error: 'No documents found in docs directory' },
                { status: 400 }
            );
        }

        // 2. Split documents into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: config.chunking.chunkSize,
            chunkOverlap: config.chunking.chunkOverlap,
        });
        const splitDocs = await splitter.splitDocuments(rawDocs);

        // 3. Create vector store and index documents
        const result = await createVectorStore(splitDocs);

        return NextResponse.json({
            success: true,
            message: `Successfully indexed ${result.chunkCount} chunks from ${rawDocs.length} documents`,
            stats: {
                documentsProcessed: rawDocs.length,
                chunksCreated: result.chunkCount,
            },
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return NextResponse.json(
            {
                error: 'Failed to ingest documents',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
