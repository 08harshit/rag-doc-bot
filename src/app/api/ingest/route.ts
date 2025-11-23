/**
 * Document Ingestion API Route
 * POST /api/ingest - Ingest and index documents from the docs directory
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import * as path from 'path';
import { loadDocuments } from '@/lib/document-loader';
import { createVectorStore } from '@/lib/vectorstore';
import { config } from '@/lib/config';
import { createSemanticChunks } from '@/lib/semantic-chunker';

export async function POST(req: NextRequest) {
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        // 1. Load documents
        console.log('📂 Loading documents from:', docsDir);
        const rawDocs = await loadDocuments(docsDir);

        if (rawDocs.length === 0) {
            return NextResponse.json(
                { error: 'No documents found in docs directory' },
                { status: 400 }
            );
        }

        console.log(`✅ Loaded ${rawDocs.length} documents`);

        // 2. Split documents into chunks
        let splitDocs;
        let chunkingMethod: string;

        if (config.chunking.useSemantic) {
            // Use AI-powered semantic chunking
            console.log('🧠 Using semantic chunking (AI-powered)');
            try {
                splitDocs = await createSemanticChunks(rawDocs, {
                    minChunkSize: config.chunking.semantic.minChunkSize,
                    maxChunkSize: config.chunking.semantic.maxChunkSize,
                    similarityThreshold: config.chunking.semantic.similarityThreshold,
                });
                chunkingMethod = 'semantic (AI-based)';
            } catch (error) {
                console.error('⚠️  Semantic chunking failed, falling back to character-based');
                // Fallback to traditional chunking
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: config.chunking.chunkSize,
                    chunkOverlap: config.chunking.chunkOverlap,
                });
                const tempDocs = await splitter.splitDocuments(rawDocs);
                // Add metadata to identify as character-based
                splitDocs = tempDocs.map(doc => new Document({
                    pageContent: doc.pageContent,
                    metadata: { ...doc.metadata, chunkType: 'character', chunkMethod: 'recursive-split' }
                }));
                chunkingMethod = 'character-based (fallback)';
            }
        } else {
            // Use traditional character-based chunking
            console.log('📏 CHARACTER-BASED CHUNKING STARTED');
            console.log(`   Settings: size=${config.chunking.chunkSize}, overlap=${config.chunking.chunkOverlap}`);
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: config.chunking.chunkSize,
                chunkOverlap: config.chunking.chunkOverlap,
            });
            const tempDocs = await splitter.splitDocuments(rawDocs);
            // Add metadata to identify as character-based
            splitDocs = tempDocs.map((doc, idx) => new Document({
                pageContent: doc.pageContent,
                metadata: { ...doc.metadata, chunkType: 'character', chunkMethod: 'recursive-split', chunkIndex: idx }
            }));
            chunkingMethod = 'character-based';
            console.log(`✂️  CHARACTER-BASED CHUNKING COMPLETE`);
            console.log(`   Total chunks created: ${splitDocs.length}\n`);
        }

        console.log(`✂️  Created ${splitDocs.length} chunks using ${chunkingMethod}`);

        // 3. Create vector store and index documents
        console.log('💾 Indexing chunks in ChromaDB...');
        const result = await createVectorStore(splitDocs);

        return NextResponse.json({
            success: true,
            message: `Successfully indexed ${result.chunkCount} chunks from ${rawDocs.length} documents`,
            stats: {
                documentsProcessed: rawDocs.length,
                chunksCreated: result.chunkCount,
                chunkingMethod: chunkingMethod,
                avgChunkSize: Math.round(
                    splitDocs.reduce((sum, doc) => sum + doc.pageContent.length, 0) / splitDocs.length
                ),
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
