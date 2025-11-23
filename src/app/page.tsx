'use client';

import { useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Home() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [activeDocument, setActiveDocument] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMessage: Message = { role: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, document: activeDocument }),
            });

            const data = await res.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer || data.error || 'Failed to get response'
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to fetch answer.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setUploadStatus('Uploading...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setUploadStatus(`✅ Upload complete!`);
                setActiveDocument(file.name);
                setTimeout(() => setUploadStatus(''), 3000);
            } else {
                setUploadStatus(`❌ ${data.error}`);
            }
        } catch (err) {
            setUploadStatus('❌ Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white font-sans relative overflow-hidden">
            {/* Animated background gradient orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-6xl mx-auto p-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8 mt-8">
                    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                        RAG Document Bot
                    </h1>
                    <p className="text-gray-400 text-lg">Ask questions about your documents with AI-powered semantic search</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Upload & Active Doc */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upload Card */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">📄</span>
                                Upload Document
                            </h3>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 transition-all">
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                    id="file-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer inline-block"
                                >
                                    <div className="text-5xl mb-3">📎</div>
                                    <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold inline-block transition-all transform hover:scale-105 shadow-lg">
                                        {uploading ? 'Uploading...' : 'Choose File'}
                                    </div>
                                    <p className="mt-3 text-sm text-gray-400">or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">PDF or TXT files</p>
                                </label>
                            </div>
                            {uploadStatus && (
                                <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm border border-white/10 animate-slideIn">
                                    {uploadStatus}
                                </div>
                            )}
                        </div>

                        {/* Active Document Display */}
                        {activeDocument && (
                            <div className="backdrop-blur-xl bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-2xl animate-slideIn">
                                <h3 className="text-sm font-medium text-blue-300 mb-2 uppercase tracking-wider">
                                    Currently Active
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl border border-blue-500/30">
                                        {activeDocument.endsWith('.pdf') ? '📕' : '📝'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-lg text-white truncate" title={activeDocument}>
                                            {activeDocument}
                                        </p>
                                        <p className="text-xs text-blue-200/70">Ready for questions</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Chat */}
                    <div className="lg:col-span-2 flex flex-col">
                        {/* Messages */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl mb-4 flex-1 min-h-[500px] max-h-[600px] overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">💬</div>
                                        <p className="text-lg">Start a conversation</p>
                                        <p className="text-sm mt-2">
                                            {activeDocument
                                                ? `Ask about "${activeDocument}"`
                                                : "Upload a document to begin"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                                        : 'bg-white/10 backdrop-blur-sm border border-white/10 text-gray-100'
                                                    }`}
                                            >
                                                <div className="text-xs font-semibold mb-1 opacity-70">
                                                    {msg.role === 'user' ? 'You' : '🤖 AI Assistant'}
                                                </div>
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start animate-slideIn">
                                            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3">
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200"></div>
                                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-400"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder={activeDocument ? `Ask about ${activeDocument}...` : "Ask me anything..."}
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !question.trim()}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 active:scale-95"
                                >
                                    {loading ? '...' : '🚀 Ask'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
