/**
 * Document Loader Service
 * Handles loading documents from the filesystem
 */

import { Document } from '@langchain/core/documents';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface LoadedDocument {
    content: string;
    metadata: {
        source: string;
        type: 'txt' | 'pdf';
    };
}

/**
 * Load a single text file
 */
async function loadTextFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
}

/**
 * Load a single PDF file
 */
async function loadPdfFile(filePath: string): Promise<string> {
    const pdf = (await import('pdf-parse-fork')).default;
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdf(dataBuffer);
    return pdfData.text;
}

/**
 * Load documents from a directory
 */
export async function loadDocuments(dirPath: string): Promise<Document[]> {
    const files = await fs.readdir(dirPath);
    const supportedFiles = files.filter(
        (f) => f.endsWith('.txt') || f.endsWith('.pdf')
    );

    const documents: Document[] = [];

    for (const file of supportedFiles) {
        const filePath = path.join(dirPath, file);

        try {
            let content = '';
            const fileType = file.endsWith('.pdf') ? 'pdf' : 'txt';

            if (fileType === 'txt') {
                content = await loadTextFile(filePath);
            } else {
                content = await loadPdfFile(filePath);
            }

            documents.push(
                new Document({
                    pageContent: content,
                    metadata: { source: filePath, type: fileType },
                })
            );
        } catch (error) {
            console.error(`Failed to load ${file}:`, error);
            // Continue loading other files even if one fails
        }
    }

    return documents;
}
