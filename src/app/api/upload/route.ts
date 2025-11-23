/**
 * Document Upload API
 * Save uploaded file to docs/ folder and trigger ingestion
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
            return NextResponse.json({
                error: 'Unsupported file type. Only .pdf and .txt are supported.'
            }, { status: 400 });
        }

        // Save file to docs/ folder
        const docsDir = path.join(process.cwd(), 'docs');
        await fs.mkdir(docsDir, { recursive: true }); // Ensure docs/ exists

        const filePath = path.join(docsDir, file.name);
        const buffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));

        console.log(`📁 File saved: ${file.name}`);

        // Call ingest API to process all documents
        const baseUrl = req.nextUrl.origin;
        const ingestRes = await fetch(`${baseUrl}/api/ingest`, {
            method: 'POST',
        });

        const ingestData = await ingestRes.json();

        if (ingestData.success) {
            return NextResponse.json({
                success: true,
                message: `Uploaded "${file.name}" and indexed documents`,
                stats: ingestData.stats,
            });
        } else {
            return NextResponse.json({
                error: 'File uploaded but ingestion failed',
                details: ingestData.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
