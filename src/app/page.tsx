'use client';

import { useState } from 'react';

export default function Home() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setAnswer('');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();
            if (data.answer) {
                setAnswer(data.answer);
            } else if (data.error) {
                setAnswer(`Error: ${data.error}`);
            }
        } catch (err) {
            setAnswer('Failed to fetch answer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    RAG Doc Bot
                </h1>

                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about your docs..."
                            className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Thinking...' : 'Ask'}
                        </button>
                    </div>
                </form>

                {answer && (
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Answer:</h2>
                        <p className="leading-relaxed whitespace-pre-wrap text-gray-300">{answer}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
