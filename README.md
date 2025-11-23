# RAG Document Bot - Production Ready

A production-grade RAG (Retrieval-Augmented Generation) chatbot built with Next.js, LangChain, Gemini AI, and ChromaDB.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Add Documents
Place your documents in the `docs/` folder (supports `.txt` and `.pdf`)

### 4. Start ChromaDB
```bash
npm run db
```

### 5. Start Development Server (in another terminal)
```bash
npm run dev
```

### 6. Index Your Documents
```bash
curl -X POST http://localhost:3000/api/ingest
```

### 7. Open the App
Visit http://localhost:3000 and start asking questions!

## 📚 API Endpoints

### POST /api/ingest
Index documents from the `docs/` directory

### POST /api/chat
Ask questions about your indexed documents

## 🏗️ Architecture

```
src/lib/           # Core services
  ├── config.ts           # Configuration
  ├── document-loader.ts  # Document loading
  ├── embeddings.ts       # Gemini embeddings
  ├── vectorstore.ts      # ChromaDB operations
  └── llm.ts             # RAG chain

src/app/
  ├── page.tsx           # Chat UI
  └── api/
      ├── ingest/route.ts  # Ingestion endpoint
      └── chat/route.ts    # Chat endpoint
```

## 📝 License
MIT
