# Phase 1: AI-Native Frontend Product Concept
**Product Name:** EduQuery AI (Study Assistant)
**Domain:** Educational Technology (EdTech)

## 1. Product Concept
EduQuery AI is an AI-native study assistant designed to help students and educators interact with their study materials. Users can upload lecture notes or PDF documents, and use a streaming chat interface to ask questions, request summaries, or generate flashcards based strictly on the provided text.

## 2. User Journeys & Interaction Flows
* **Primary Flow (Document Query):** User uploads a PDF -> Frontend parses the file state -> User types a question in the chat UI -> UI streams the AI's response in real-time -> User reviews the source citation provided by the AI.
* **Assistive Action Flow (Quick Summarize):** User clicks a pre-defined "Summarize Document" UI button -> System automatically prompts the model -> UI displays a structured markdown summary.
* **Fallback State:** If the AI cannot find the answer in the uploaded document, the UI displays a structured fallback message: "I cannot find this information in the provided document. Please ask about the uploaded text."

## 3. System Boundaries
* **Frontend:** Next.js (App Router), React, Tailwind CSS. Handles routing, state management, file upload UI, and rendering the streaming chat interface.
* **Backend:** Next.js API Routes / Server Actions. Handles secure communication with the AI provider and file parsing.
* **AI Model:** OpenAI (GPT-4o-mini) or Anthropic (Claude 3.5 Haiku) for fast, cost-effective text reasoning and response generation.
* **Data Layer:** Temporary server-side memory for active chat sessions.

## 4. Risks & Data Boundaries
* **Primary Risk (Hallucination):** The AI inventing facts not present in the study material. Mitigated by strict system prompts requiring the model to answer *only* from the provided context.
* **Data Exposure:** Uploaded user documents must not be exposed to the frontend framework's public state or used to train public models. 
* **Security:** API keys for the chosen LLM must remain strictly on the server (Next.js server-side) and never be exposed to the client.

## 5. AI Ensemble Success Criteria
* **Accuracy:** The AI must cite specific sections of the uploaded document in 90% of its answers.
* **Latency:** The chat interface must begin streaming the first token of the AI's response within 1.5 seconds of the user submitting a prompt.
* **Resilience:** The UI must gracefully handle and display error states if the AI API times out or fails.

## Phase 2: Technical Foundation & Architecture

### Server vs. Client Boundaries
* **Server Components:** Used by default for layout rendering and data fetching to keep bundle sizes small and hide sensitive logic.
* **Client Components:** Used only when interactivity is needed (e.g., the chat input field, streaming message UI). These will be explicitly marked with the `"use client"` directive.
* **Server Actions:** Will be used for secure, asynchronous tasks like processing the uploaded PDFs and communicating with the LLM.

### Environment Variables Security
* API keys (e.g., `OPENAI_API_KEY`) are stored in `.env.local`. They are deliberately NOT prefixed with `NEXT_PUBLIC_` to ensure they never leak to the client bundle.

### Basic Security Checklist
- [x] Environment variables configured securely (Server-side only).
- [x] TypeScript strict mode enabled to catch type errors at build time.
- [ ] (Pending Phase 3) Input sanitization for user chat queries.
- [ ] (Pending Phase 6) File type and size validation for PDF uploads.