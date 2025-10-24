# PNLD Chat Application - Development Tasks

> **Project Status**: Backend deployed on Fly.io with embeddings working. Frontend has placeholder routes. Need to build UI and integrate everything.
> **Figma Design**: <https://www.figma.com/design/gGXYN0dG2nj2bCqxUwV8sc/MokLabs?node-id=357-766&m=dev>

---

## 🎯 Overview

This document outlines all remaining tasks to complete the PNLD Chat application, which uses RAG (Retrieval-Augmented Generation) to answer questions about PNLD editals.

**Current State:**

- ✅ Backend API deployed on Fly.io
- ✅ Supabase database with pgvector for embeddings
- ✅ OpenAI integration for embeddings and chat
- ✅ Document indexing (text and PDF) working
- ✅ Basic RAG pipeline implemented
- ✅ API client library created (`apps/web/lib/pnld-ai-client.ts`)
- ✅ TypeScript types package (`packages/pnld-types`)
- ⏳ Frontend has only placeholders
- ❌ No streaming support yet
- ❌ Missing document management UI
- ❌ Missing chat UI

---

## 📋 Task Categories

1. [Backend Tasks](#backend-tasks) - API improvements and streaming
2. [Frontend Tasks](#frontend-tasks) - UI implementation
3. [Integration Tasks](#integration-tasks) - Connect frontend to backend
4. [Testing & Polish](#testing--polish) - QA and refinements

---

## Backend Tasks

### TASK-BE-001: Implement Streaming Chat Response

**Priority**: 🔴 HIGH

**Description**:
Add Server-Sent Events (SSE) streaming support to the chat endpoint to enable real-time streaming of AI responses to the frontend.

**Current State**:

- Chat endpoint (`POST /api/v1/chat`) returns complete response in one go
- Uses `openai.chat.completions.create()` (non-streaming)

**Acceptance Criteria**:

- [ ] New endpoint `POST /api/v1/chat/stream` that returns SSE stream
- [ ] Uses `openai.chat.completions.stream()` for streaming responses
- [ ] Streams tokens as they arrive from OpenAI
- [ ] Sends sources/citations after completion in final event
- [ ] Returns conversation_id in the stream metadata
- [ ] Gracefully handles errors and sends error events
- [ ] Existing non-streaming endpoint remains functional

**Technical Notes**:

- Use FastAPI's `StreamingResponse` with `text/event-stream` content type
- Send events in SSE format: `data: {json}\n\n`
- Consider event types: `token`, `source`, `done`, `error`
- Store complete message in database after streaming completes
- Reference: `app/api/v1/chat.py:chat_endpoint()`

**Implementation Steps**:

1. Create `chat_stream_endpoint()` in `app/api/v1/chat.py`
2. Add `generate_rag_response_stream()` in `app/services/rag.py`
3. Modify to use `openai.chat.completions.stream()`
4. Implement SSE event generator
5. Update API routes to include new endpoint
6. Test with curl/Postman using SSE

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/chat.py`
- `apps/pnld-ai-service/app/services/rag.py`

---

### TASK-BE-002: Implement Conversation History Retrieval

**Priority**: 🟡 MEDIUM

**Description**:
Complete the placeholder endpoint to retrieve full conversation history by conversation ID.

**Current State**:

- Endpoint exists but returns TODO placeholder
- Database schema supports conversation storage
- Messages are being stored correctly

**Acceptance Criteria**:

- [ ] `GET /api/v1/chat/{conversation_id}` returns full conversation
- [ ] Returns messages in chronological order
- [ ] Includes conversation metadata (edital_id, created_at, updated_at)
- [ ] Returns 404 if conversation not found
- [ ] Includes proper error handling

**Technical Notes**:

- Query `chat_messages` table filtered by `conversation_id`
- Join with `chat_conversations` for metadata
- Order by `created_at ASC`
- Reference: `app/api/v1/chat.py:get_conversation()`

**Response Schema**:

```typescript
{
  conversation_id: string;
  edital_id?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
```

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/chat.py`
- `apps/pnld-ai-service/app/models/chat.py` (add ConversationHistory model)

---

### TASK-BE-003: Implement Document Retrieval Endpoint

**Priority**: 🟡 MEDIUM

**Description**:
Complete the placeholder endpoint to retrieve document details by ID.

**Current State**:

- Endpoint exists but returns TODO placeholder
- Documents are stored in `pnld_documents` table

**Acceptance Criteria**:

- [ ] `GET /api/v1/documents/{document_id}` returns document details
- [ ] Includes document metadata (title, edital_id, created_at, etc.)
- [ ] Returns chunk count and embedding count
- [ ] Returns 404 if document not found
- [ ] Optionally includes sample chunks (query param `include_chunks=true`)

**Technical Notes**:

- Query `pnld_documents` table
- Count related embeddings in `pnld_embeddings`
- Reference: `app/api/v1/documents.py:get_document()`

**Response Schema**:

```typescript
{
  id: string;
  edital_id: string;
  title: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  chunks_count: number;
  embeddings_count: number;
  sample_chunks?: Array<{content: string, page_number?: number}>;
}
```

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/documents.py`
- `apps/pnld-ai-service/app/models/document.py` (add DocumentDetail model)

---

### TASK-BE-004: Implement Document Deletion Endpoint

**Priority**: 🟡 MEDIUM

**Description**:
Complete the placeholder endpoint to delete documents and their embeddings.

**Current State**:

- Endpoint exists but returns TODO placeholder
- Database has foreign key constraints set up

**Acceptance Criteria**:

- [ ] `DELETE /api/v1/documents/{document_id}` deletes document
- [ ] Cascades deletion to all related embeddings in `pnld_embeddings`
- [ ] Returns 204 No Content on success
- [ ] Returns 404 if document not found
- [ ] Returns deletion confirmation with counts

**Technical Notes**:

- Delete from `pnld_embeddings` first (or use CASCADE)
- Then delete from `pnld_documents`
- Return count of embeddings deleted
- Reference: `app/api/v1/documents.py:delete_document()`

**Response Schema**:

```typescript
{
  message: string;
  document_id: string;
  embeddings_deleted: number;
}
```

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/documents.py`

---

### TASK-BE-005: Add PDF Upload Endpoint

**Priority**: 🔴 HIGH

**Description**:
Create endpoint to upload PDF files directly instead of requiring pre-extracted text.

**Current State**:

- `POST /api/v1/documents/index-pdf` expects text content + metadata
- No file upload support

**Acceptance Criteria**:

- [ ] New endpoint `POST /api/v1/documents/upload-pdf` accepts multipart/form-data
- [ ] Accepts PDF file, edital_id, title, and optional metadata
- [ ] Validates file type (PDF only)
- [ ] Validates file size (e.g., max 50MB)
- [ ] Extracts text from PDF using existing service
- [ ] Generates embeddings and stores in database
- [ ] Returns document_id and processing summary

**Technical Notes**:

- Use FastAPI's `UploadFile` for file handling
- Leverage existing `process_pdf_to_chunks()` in embeddings service
- Add file validation middleware
- Consider async processing for large files
- Store original filename in metadata

**Request Format**:

```bash
POST /api/v1/documents/upload-pdf
Content-Type: multipart/form-data

file: [PDF binary]
edital_id: string
title: string
metadata: JSON string (optional)
```

**Response Schema**:

```typescript
{
  document_id: string;
  edital_id: string;
  title: string;
  filename: string;
  pages_processed: number;
  chunks_created: number;
  status: "success" | "processing" | "failed";
}
```

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/documents.py`
- `apps/pnld-ai-service/app/models/document.py` (add PdfUploadResponse model)
- `apps/pnld-ai-service/pyproject.toml` (may need python-multipart)

---

### TASK-BE-006: Add List Documents Endpoint

**Priority**: 🟡 MEDIUM

**Description**:
Create endpoint to list all documents with pagination and filtering.

**Acceptance Criteria**:

- [ ] New endpoint `GET /api/v1/documents` returns paginated document list
- [ ] Supports query params: `edital_id`, `limit`, `offset`, `sort_by`
- [ ] Returns document metadata without full content
- [ ] Includes chunk/embedding counts per document
- [ ] Returns total count for pagination

**Request Format**:

```bash
GET /api/v1/documents?edital_id=xxx&limit=20&offset=0&sort_by=created_at
```

**Response Schema**:

```typescript
{
  documents: Array<{
    id: string;
    edital_id: string;
    title: string;
    chunks_count: number;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

**Files to Modify**:

- `apps/pnld-ai-service/app/api/v1/documents.py`
- `apps/pnld-ai-service/app/models/document.py`

---

## Frontend Tasks

### TASK-FE-001: Build Chat UI Components (Based on Figma)

**Priority**: 🔴 HIGH

**Description**:
Implement the complete chat interface based on the Figma design at node-id=357:766.

**Figma Reference**: <https://www.figma.com/design/gGXYN0dG2nj2bCqxUwV8sc/MokLabs?node-id=357-766&m=dev>

**Current State**:

- `/pnld-chat` route has placeholder component
- No chat UI components exist

**Acceptance Criteria**:

- [ ] Chat interface matches Figma design (layout, colors, spacing, typography)
- [ ] Message list component displays user and assistant messages
- [ ] Message input component with send button
- [ ] Auto-scroll to bottom on new messages
- [ ] Loading indicator while AI is responding
- [ ] Disabled input while waiting for response
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Accessible (keyboard navigation, ARIA labels)

**Components to Create**:

```bash
apps/web/components/pnld-chat/
├── ChatInterface.tsx          # Main container
├── MessageList.tsx            # Scrollable message area
├── Message.tsx                # Individual message bubble
├── MessageInput.tsx           # Text input + send button
├── TypingIndicator.tsx        # "AI is typing..." animation
├── SourceCitation.tsx         # Display document sources
└── EmptyState.tsx             # Initial state before messages
```

**Technical Notes**:

- Use existing design system components where possible
- Extract colors/spacing from Figma design (use Figma MCP when desktop app is open)
- Use `useRef` for auto-scroll to bottom
- Consider using `react-markdown` for formatting AI responses
- Add syntax highlighting for code blocks if needed

**Files to Create**:

- `apps/web/components/pnld-chat/*.tsx` (7+ components)
- `apps/web/app/pnld-chat/page.tsx` (replace placeholder)
- `apps/web/styles/pnld-chat.css` (if needed, or use Tailwind)

---

### TASK-FE-002: Implement Chat State Management

**Priority**: 🔴 HIGH

**Description**:
Set up state management for chat messages, conversation tracking, and loading states.

**Acceptance Criteria**:

- [ ] Create custom hook `usePnldChat()` for chat state
- [ ] Manages messages array (user + assistant)
- [ ] Tracks conversation_id
- [ ] Handles loading/error states
- [ ] Provides `sendMessage()` function
- [ ] Stores conversation_id in localStorage (for single conversation mode)
- [ ] Clears conversation when needed

**Hook API**:

```typescript
const {
  messages, // ChatMessage[]
  conversationId, // string | null
  isLoading, // boolean
  error, // Error | null
  sendMessage, // (message: string) => Promise<void>
  clearConversation, // () => void
} = usePnldChat();
```

**Technical Notes**:

- Use `useState` for messages and loading states
- Use `useEffect` to load conversation_id from localStorage
- Implement optimistic updates (add user message immediately)
- Handle errors gracefully with retry logic
- Consider using React Query for caching if needed

**Files to Create**:

- `apps/web/hooks/usePnldChat.ts`

---

### TASK-FE-003: Implement Streaming Chat Integration

**Priority**: 🔴 HIGH

**Description**:
Integrate frontend with the streaming chat endpoint using Server-Sent Events (SSE).

**Dependencies**: TASK-BE-001 (backend streaming must be implemented first)

**Acceptance Criteria**:

- [ ] Connect to `POST /api/v1/chat/stream` endpoint
- [ ] Display tokens as they stream in real-time
- [ ] Show typing indicator while streaming
- [ ] Update message content progressively
- [ ] Handle SSE events: `token`, `source`, `done`, `error`
- [ ] Append sources/citations after stream completes
- [ ] Handle connection errors and reconnection
- [ ] Cancel stream if user navigates away

**Technical Notes**:

- Use `EventSource` API for SSE or a library like `eventsource-parser`
- For POST with SSE, may need `fetch` + ReadableStream instead of EventSource
- Parse SSE events manually if using fetch
- Accumulate tokens into message content
- Reference: <https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events>

**Example Flow**:

1. User sends message
2. Add user message to UI immediately (optimistic)
3. Open SSE connection to `/api/v1/chat/stream`
4. Create empty assistant message
5. As `token` events arrive, append to assistant message
6. When `source` events arrive, add to citations
7. On `done` event, finalize message
8. On `error` event, show error state

**Files to Modify**:

- `apps/web/hooks/usePnldChat.ts`
- `apps/web/lib/pnld-ai-client.ts` (add `chatStream()` method)

---

### TASK-FE-004: Build Document Management UI

**Priority**: 🔴 HIGH

**Description**:
Create a complete document management interface for uploading, viewing, and deleting PNLD documents.

**Current State**:

- `/pnld-chat/dashboard` has placeholder

**Acceptance Criteria**:

- [ ] **Upload View**: Drag-and-drop or file picker for PDF upload
- [ ] Shows upload progress bar
- [ ] Validates file type (PDF only) and size
- [ ] Requires edital_id and title input
- [ ] **List View**: Table/grid of all documents
- [ ] Shows document title, edital_id, chunks count, date
- [ ] Supports filtering by edital_id
- [ ] Pagination (20 items per page)
- [ ] **Detail View**: Shows document metadata
- [ ] Displays chunks count, pages count
- [ ] Shows sample chunks with page numbers
- [ ] **Delete Action**: Confirm before delete
- [ ] Shows success/error toast notifications

**Components to Create**:

```bash
apps/web/components/pnld-docs/
├── DocumentUpload.tsx         # Upload form with drag-drop
├── DocumentList.tsx           # Table/grid of documents
├── DocumentListItem.tsx       # Single document row/card
├── DocumentDetail.tsx         # Document details modal/page
├── DocumentDeleteDialog.tsx   # Confirmation dialog
└── UploadProgress.tsx         # Progress indicator
```

**Technical Notes**:

- Use `react-dropzone` for drag-and-drop upload
- Use `FormData` for multipart/form-data upload
- Show upload progress using `XMLHttpRequest` or fetch with progress events
- Use modal or separate page for document details
- Add loading skeletons for better UX

**Files to Create**:

- `apps/web/components/pnld-docs/*.tsx` (6 components)
- `apps/web/app/pnld-chat/dashboard/page.tsx` (replace placeholder)
- `apps/web/hooks/useDocumentUpload.ts`
- `apps/web/hooks/useDocuments.ts`

---

### TASK-FE-005: Create Document Management Hooks

**Priority**: 🔴 HIGH

**Description**:
Create custom hooks for document operations (upload, list, delete, get details).

**Acceptance Criteria**:

- [ ] `useDocuments()` - Fetch and filter document list
- [ ] `useDocumentUpload()` - Handle PDF upload with progress
- [ ] `useDocumentDetails()` - Fetch single document details
- [ ] `useDocumentDelete()` - Delete document with confirmation
- [ ] All hooks handle loading and error states
- [ ] Support for optimistic updates where appropriate

**Hook APIs**:

```typescript
// List documents
const {
  documents,
  total,
  isLoading,
  error,
  fetchDocuments,
} = useDocuments({ editalId?, limit, offset });

// Upload document
const {
  upload,
  isUploading,
  progress,
  error,
} = useDocumentUpload();

// Get document details
const {
  document,
  isLoading,
  error,
} = useDocumentDetails(documentId);

// Delete document
const {
  deleteDocument,
  isDeleting,
  error,
} = useDocumentDelete();
```

**Technical Notes**:

- Use React Query or SWR for caching (optional but recommended)
- For upload progress, use XMLHttpRequest with `onprogress` event
- Implement proper error handling with user-friendly messages
- Invalidate document list cache after upload/delete

**Files to Create**:

- `apps/web/hooks/useDocuments.ts`
- `apps/web/hooks/useDocumentUpload.ts`
- `apps/web/hooks/useDocumentDetails.ts`
- `apps/web/hooks/useDocumentDelete.ts`

---

### TASK-FE-006: Update API Client for New Endpoints

**Priority**: 🔴 HIGH

**Description**:
Extend the `pnld-ai-client.ts` to support all new backend endpoints.

**Current State**:

- Client has basic methods: `chat()`, `getConversation()`, `indexDocument()`, `getDocument()`, `deleteDocument()`
- Missing: streaming, upload, list documents

**Acceptance Criteria**:

- [ ] Add `chatStream()` method for SSE streaming
- [ ] Add `uploadPdf()` method for file upload with progress callback
- [ ] Add `listDocuments()` method with query params
- [ ] Update types to match backend response schemas
- [ ] Add proper error handling and response validation

**New Methods**:

```typescript
class PnldAiClient {
  // Streaming chat
  async chatStream(
    request: ChatRequest,
    onToken: (token: string) => void,
    onSource: (source: DocumentSource) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): Promise<void>;

  // Upload PDF with progress
  async uploadPdf(
    file: File,
    editalId: string,
    title: string,
    metadata?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<DocumentIndexResponse>;

  // List documents
  async listDocuments(params: {
    editalId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }): Promise<DocumentListResponse>;
}
```

**Files to Modify**:

- `apps/web/lib/pnld-ai-client.ts`
- `packages/pnld-types/src/document.ts` (add DocumentListResponse type)

---

### TASK-FE-007: Add Source Citations Display

**Priority**: 🟡 MEDIUM

**Description**:
Display document sources and citations for each AI response.

**Acceptance Criteria**:

- [ ] Show sources below each assistant message
- [ ] Display document title, page number, relevance score
- [ ] Show excerpt/snippet from the source document
- [ ] Support expanding/collapsing sources
- [ ] Click to view full document details (links to document detail page)
- [ ] Visual indicator of relevance score (e.g., color-coded)

**Component Structure**:

```typescript
<Message role="assistant">
  <MessageContent>{content}</MessageContent>
  <SourceCitations sources={sources}>
    <SourceCitation
      title="PNLD 2025 Edital"
      page={42}
      excerpt="..."
      relevance={0.89}
      onClick={() => viewDocument(source.document_id)}
    />
  </SourceCitations>
</Message>
```

**Technical Notes**:

- Sources come from `ChatResponse.sources` array
- Relevance score is 0-1, consider showing as percentage
- Truncate excerpts to ~200 chars with "..."
- Add icon or badge for page number
- Use accordion or expandable cards for better UX

**Files to Modify**:

- `apps/web/components/pnld-chat/SourceCitation.tsx`
- `apps/web/components/pnld-chat/Message.tsx`

---

### TASK-FE-008: Add Error Handling & Loading States

**Priority**: 🟡 MEDIUM

**Description**:
Implement comprehensive error handling and loading states across the application.

**Acceptance Criteria**:

- [ ] Show loading skeletons while fetching data
- [ ] Display user-friendly error messages
- [ ] Add retry buttons for failed requests
- [ ] Show toast notifications for success/error actions
- [ ] Handle network errors gracefully
- [ ] Show offline indicator if no connection
- [ ] Add timeout handling for slow requests

**Error Scenarios to Handle**:

- Network timeout
- 404 Not Found (conversation/document)
- 500 Server Error
- Invalid PDF file
- File too large
- Backend service down
- SSE connection lost

**Technical Notes**:

- Use a toast library like `react-hot-toast` or `sonner`
- Create reusable error boundary components
- Map backend error codes to user-friendly messages
- Add retry logic with exponential backoff
- Consider global error handler

**Files to Create/Modify**:

- `apps/web/components/ui/ErrorBoundary.tsx`
- `apps/web/components/ui/LoadingSkeleton.tsx`
- `apps/web/lib/error-handler.ts`
- `apps/web/hooks/*.ts` (add error handling to all hooks)

---

### TASK-FE-009: Implement Responsive Design

**Priority**: 🟡 MEDIUM

**Description**:
Ensure all UI components work seamlessly on desktop, tablet, and mobile devices.

**Acceptance Criteria**:

- [ ] Chat interface responsive on all screen sizes
- [ ] Document management UI adapts to mobile (table → cards)
- [ ] Navigation works on mobile (hamburger menu if needed)
- [ ] Touch-friendly buttons and inputs (min 44px touch targets)
- [ ] Proper viewport settings in layout
- [ ] Test on various devices/simulators

**Breakpoints** (use Tailwind defaults):

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Key Responsive Changes**:

- Chat: Full-width on mobile, max-width on desktop
- Document list: Grid → single column on mobile
- Upload: Stack form fields vertically on mobile
- Message bubbles: Adjust max-width for readability

**Files to Modify**:

- All component files in `apps/web/components/pnld-chat/`
- All component files in `apps/web/components/pnld-docs/`

---

## Integration Tasks

### TASK-INT-001: Configure Environment Variables

**Priority**: 🔴 HIGH

**Description**:
Set up all required environment variables for frontend-backend communication.

**Acceptance Criteria**:

- [ ] Add `NEXT_PUBLIC_PNLD_AI_SERVICE_URL` to `.env.local`
- [ ] Document all env vars in `.env.example`
- [ ] Add deployment env vars to Vercel project settings
- [ ] Verify backend URL in production (Fly.io URL)
- [ ] Test local development with backend running

**Environment Variables**:

**Frontend (`apps/web/.env.local`)**:

```bash
NEXT_PUBLIC_PNLD_AI_SERVICE_URL=https://pnld-ai-service.fly.dev
# For local development:
# NEXT_PUBLIC_PNLD_AI_SERVICE_URL=http://localhost:8000
```

**Backend (Fly.io secrets)** - Already configured, verify:

```bash
SUPABASE_URL=https://mdulampmbhnpiaucgnfg.supabase.co
SUPABASE_SERVICE_KEY=***
OPENAI_API_KEY=***
CORS_ORIGINS=https://moklabs-landing.vercel.app,http://localhost:3000
```

**Files to Modify**:

- `apps/web/.env.example`
- `apps/web/.env.local` (local only, not committed)
- Vercel project settings (via dashboard or CLI)

---

### TASK-INT-002: Configure CORS for Production

**Priority**: 🔴 HIGH

**Description**:
Update backend CORS settings to allow requests from production frontend domain.

**Current State**:

- Backend has CORS middleware configured
- Need to add Vercel production domain

**Acceptance Criteria**:

- [ ] Add Vercel production URL to `CORS_ORIGINS` env var
- [ ] Test preflight OPTIONS requests from frontend
- [ ] Verify credentials and headers are allowed
- [ ] Test from production deployment

**CORS Configuration**:

```python
# In backend config
CORS_ORIGINS = [
    "https://moklabs-landing.vercel.app",  # Production
    "http://localhost:3000",                # Local dev
    "http://127.0.0.1:3000",                # Local dev alternative
]
```

**Files to Modify**:

- Fly.io secrets (set `CORS_ORIGINS` env var)
- `apps/pnld-ai-service/app/config.py` (verify config)
- `apps/pnld-ai-service/app/main.py` (verify CORS middleware)

---

### TASK-INT-003: Test End-to-End Flows

**Priority**: 🟡 MEDIUM

**Description**:
Comprehensive testing of all user flows from frontend through backend.

**Test Scenarios**:

1.Document Upload Flow

- [ ] Upload valid PDF file
- [ ] Verify file validation (reject non-PDF)
- [ ] Verify size validation (reject > 50MB)
- [ ] Check upload progress indicator works
- [ ] Confirm document appears in list after upload
- [ ] Verify embeddings created in database

  2.Chat Flow

- [ ] Send first message (creates new conversation)
- [ ] Verify streaming works (tokens appear progressively)
- [ ] Check sources/citations display correctly
- [ ] Send follow-up message (same conversation)
- [ ] Verify conversation_id persists in localStorage
- [ ] Test with no documents (should handle gracefully)

  3.Document Management Flow

- [ ] List all documents
- [ ] Filter by edital_id
- [ ] View document details
- [ ] Delete document
- [ ] Verify deletion cascades to embeddings

  4.Error Handling

- [ ] Test with backend offline
- [ ] Test with invalid conversation_id
- [ ] Test with network timeout
- [ ] Test with malformed response

**Files to Create**:

- `apps/web/__tests__/integration/pnld-chat.test.tsx` (if using Jest/Playwright)
- Manual QA checklist document

---

### TASK-INT-004: Add Analytics and Monitoring

**Priority**: 🟢 LOW

**Description**:
Add basic analytics to track usage and errors.

**Acceptance Criteria**:

- [ ] Track chat message count
- [ ] Track document upload success/failure rate
- [ ] Track API error rates
- [ ] Monitor SSE connection stability
- [ ] Log errors to error tracking service (e.g., Sentry)

**Events to Track**:

- `chat_message_sent`
- `chat_response_received`
- `document_uploaded`
- `document_deleted`
- `api_error`
- `sse_connection_failed`

**Technical Notes**:

- Use Vercel Analytics (built-in)
- Consider PostHog or Mixpanel for product analytics
- Use Sentry for error tracking
- Don't track user messages (privacy)

**Files to Create/Modify**:

- `apps/web/lib/analytics.ts`
- `apps/web/app/layout.tsx` (add analytics provider)

---

## Testing & Polish

### TASK-TEST-001: Write Unit Tests for Hooks

**Priority**: 🟡 MEDIUM

**Description**:
Add unit tests for all custom React hooks.

**Acceptance Criteria**:

- [ ] Test `usePnldChat` hook
- [ ] Test `useDocuments` hook
- [ ] Test `useDocumentUpload` hook
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Achieve >80% code coverage for hooks

**Testing Library**:

- Use `@testing-library/react-hooks` or `@testing-library/react`
- Mock `pnld-ai-client` methods
- Mock localStorage for conversation persistence

**Files to Create**:

- `apps/web/hooks/__tests__/usePnldChat.test.ts`
- `apps/web/hooks/__tests__/useDocuments.test.ts`
- `apps/web/hooks/__tests__/useDocumentUpload.test.ts`

---

### TASK-TEST-002: Write Backend Tests for New Endpoints

**Priority**: 🟡 MEDIUM

**Description**:
Add pytest tests for all new backend endpoints.

**Acceptance Criteria**:

- [ ] Test streaming chat endpoint
- [ ] Test conversation history retrieval
- [ ] Test document upload with file
- [ ] Test document list with filters
- [ ] Test document deletion
- [ ] Mock OpenAI API calls
- [ ] Mock Supabase database calls

**Files to Create**:

- `apps/pnld-ai-service/tests/test_chat_stream.py`
- `apps/pnld-ai-service/tests/test_documents.py`
- `apps/pnld-ai-service/tests/test_conversation_history.py`

---

### TASK-POLISH-001: Add Loading Skeletons

**Priority**: 🟢 LOW

**Description**:
Replace generic loading spinners with content-aware skeleton loaders.

**Acceptance Criteria**:

- [ ] Chat message skeleton (pulsing message bubbles)
- [ ] Document list skeleton (pulsing table rows/cards)
- [ ] Document detail skeleton
- [ ] Match the shape of actual content

**Files to Create**:

- `apps/web/components/ui/ChatSkeleton.tsx`
- `apps/web/components/ui/DocumentListSkeleton.tsx`

---

### TASK-POLISH-002: Add Keyboard Shortcuts

**Priority**: 🟢 LOW

**Description**:
Implement keyboard shortcuts for common actions.

**Acceptance Criteria**:

- [ ] `Enter` to send message (already standard)
- [ ] `Shift+Enter` for new line in message input
- [ ] `Cmd/Ctrl+K` to focus message input
- [ ] `Escape` to close modals/dialogs
- [ ] Show keyboard shortcut hints on hover

**Files to Modify**:

- `apps/web/components/pnld-chat/MessageInput.tsx`
- Add global keyboard handler in layout

---

### TASK-POLISH-003: Improve Accessibility (a11y)

**Priority**: 🟡 MEDIUM

**Description**:
Ensure the application meets WCAG 2.1 AA standards.

**Acceptance Criteria**:

- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on all components
- [ ] Focus indicators visible
- [ ] Color contrast meets AA standards (4.5:1)
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Form validation errors announced
- [ ] Loading states announced

**Tools**:

- Use `axe-core` or `@axe-core/react` for automated testing
- Use Lighthouse accessibility audit
- Manual testing with screen reader

**Files to Modify**:

- All component files (add ARIA attributes)
- `apps/web/app/layout.tsx` (add skip-to-content link)

---

### TASK-POLISH-004: Add Empty States and Onboarding

**Priority**: 🟢 LOW

**Description**:
Create helpful empty states and basic onboarding for first-time users.

**Acceptance Criteria**:

- [ ] Empty state for chat (suggest example questions)
- [ ] Empty state for document list (prompt to upload first doc)
- [ ] Welcome modal on first visit (optional)
- [ ] Tooltips for key features
- [ ] Sample conversation starter suggestions

**Components**:

```bash
apps/web/components/pnld-chat/
├── EmptyState.tsx
└── SuggestedQuestions.tsx

apps/web/components/pnld-docs/
└── EmptyDocumentState.tsx
```

**Files to Create**:

- `apps/web/components/pnld-chat/EmptyState.tsx`
- `apps/web/components/pnld-chat/SuggestedQuestions.tsx`
- `apps/web/components/pnld-docs/EmptyDocumentState.tsx`

---

## 📊 Task Summary

**Total Tasks**: 29

**By Priority**:

- 🔴 HIGH: 12 tasks
- 🟡 MEDIUM: 11 tasks
- 🟢 LOW: 6 tasks

**By Category**:

- Backend: 6 tasks
- Frontend: 9 tasks
- Integration: 4 tasks
- Testing: 2 tasks
- Polish: 4 tasks

**Estimated Timeline**:

- High Priority: 3-4 weeks (core functionality)
- Medium Priority: 2-3 weeks (polish and reliability)
- Low Priority: 1 week (nice-to-haves)

**Total Estimated**: 6-8 weeks for complete implementation

---

## 🚀 Suggested Implementation Order

### Phase 1: Core Backend (Week 1-2)

1. TASK-BE-001: Streaming chat
2. TASK-BE-005: PDF upload endpoint
3. TASK-BE-006: List documents endpoint
4. TASK-BE-002: Conversation history
5. TASK-BE-003: Document retrieval
6. TASK-BE-004: Document deletion

### Phase 2: Core Frontend (Week 3-4)

1. TASK-FE-001: Chat UI components
2. TASK-FE-002: Chat state management
3. TASK-FE-004: Document management UI
4. TASK-FE-005: Document hooks
5. TASK-FE-006: Update API client

### Phase 3: Integration (Week 5)

1. TASK-INT-001: Environment variables
2. TASK-INT-002: CORS configuration
3. TASK-FE-003: Streaming integration
4. TASK-FE-007: Source citations
5. TASK-INT-003: E2E testing

### Phase 4: Polish (Week 6-7)

1. TASK-FE-008: Error handling
2. TASK-FE-009: Responsive design
3. TASK-POLISH-003: Accessibility
4. TASK-TEST-001: Frontend tests
5. TASK-TEST-002: Backend tests

### Phase 5: Final Touches (Week 8)

1. TASK-POLISH-001: Loading skeletons
2. TASK-POLISH-002: Keyboard shortcuts
3. TASK-POLISH-004: Empty states
4. TASK-INT-004: Analytics

---

## 📝 Notes

- **Figma Design**: Use MCP to extract exact styles when desktop app is open
- **Authentication**: Deferred - add in future sprint
- **Multi-conversation**: Deferred - single conversation mode for now
- **Backend Deployment**: Already on Fly.io at <https://pnld-ai-service.fly.dev>
- **Database**: Supabase PostgreSQL with pgvector already set up
- **Types Package**: Already exists at `packages/pnld-types`

---

## ✅ Review Checklist

Before starting implementation, verify:

- [ ] Backend is accessible and healthy (check `/api/v1/health`)
- [ ] Supabase connection working (check `/api/v1/health/supabase`)
- [ ] OpenAI API key is valid and has credits
- [ ] Figma design is accessible via desktop app
- [ ] Environment variables documented
- [ ] Task priorities and timeline agreed upon
- [ ] Any questions or ambiguities clarified

---

**Last Updated**: 2025-10-21
**Status**: Ready for review and refinement
**Next Step**: Review tasks, adjust priorities, then begin Phase 1
