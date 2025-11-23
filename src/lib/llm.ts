/**
 * LLM Service
 * Handles chat model interactions
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { config } from './config';
import { searchDocuments } from './vectorstore';

const SYSTEM_PROMPT = `You are a helpful assistant. Answer the question based only on the following context. If the answer is not in the context, say "I don't know based on the provided documents."

Context:
{context}

Question: {question}
`;

/**
 * Generate answer using RAG pipeline
 */
export async function generateAnswer(question: string): Promise<string> {
    // 1. Retrieve relevant documents
    const relevantDocs = await searchDocuments(question);

    // 2. Format context
    const context = relevantDocs
        .map((doc: Document) => doc.pageContent)
        .join('\n\n');

    // 3. Initialize LLM
    const llm = new ChatGoogleGenerativeAI({
        apiKey: config.gemini.apiKey,
        model: config.gemini.chatModel,
        temperature: 0.7,
    });

    // 4. Create prompt
    const prompt = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

    // 5. Build and execute chain
    const chain = RunnableSequence.from([
        {
            context: () => context,
            question: new RunnablePassthrough(),
        },
        prompt,
        llm,
        new StringOutputParser(),
    ]);

    return await chain.invoke(question);
}
