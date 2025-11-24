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

const SYSTEM_PROMPT = `You are a helpful assistant. Answer the question based on the following context. If the answer is not in the context, or if the question requires general knowledge (like comparisons), use your own knowledge to answer.

Context:
{context}

Question: {question}
`;

/**
 * Generate answer using RAG pipeline
 */
export async function generateAnswer(question: string, filename?: string): Promise<string> {
    // 1. Retrieve relevant documents (with filter if provided)
    const filter = filename ? { source: filename } : undefined;

    console.log(`\n🔍 Searching for: "${question}"`);
    if (filename) console.log(`📂 Filtering by document: ${filename}`);

    const relevantDocs = await searchDocuments(question, undefined, filter);

    // LOGGING: Show what the AI is actually reading
    console.log("\n🔍 --- RETRIEVED CONTEXT ---");
    if (relevantDocs.length === 0) {
        console.log("⚠️ NO RELEVANT DOCUMENTS FOUND");
    }
    relevantDocs.forEach((doc, i) => {
        console.log(`\n📄 Chunk ${i + 1} (Source: ${doc.metadata.source}):`);
        console.log(doc.pageContent.slice(0, 150).replace(/\n/g, ' ') + "...");
    });
    console.log("----------------------------\n");

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
