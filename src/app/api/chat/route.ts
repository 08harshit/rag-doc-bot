/**
 * Chat API Route
 * POST /api/chat - Answer questions using RAG
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAnswer } from '@/lib/llm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, document } = body;

        // Validate input
        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required and must be a string' },
                { status: 400 }
            );
        }

        if (question.trim().length === 0) {
            return NextResponse.json(
                { error: 'Question cannot be empty' },
                { status: 400 }
            );
        }

        // Generate answer using RAG with optional document filter
        const answer = await generateAnswer(question, document);

        return NextResponse.json({
            success: true,
            answer
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate answer',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
