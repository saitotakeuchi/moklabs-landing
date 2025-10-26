# PNLD Chat - End-to-End QA Checklist

This document contains comprehensive test scenarios for manual QA testing of the PNLD Chat feature.

## Prerequisites

### Environment Setup

1. **Backend Running**

   ```bash
   cd apps/pnld-ai-service
   python -m uvicorn app.main:app --reload --port 8000
   ```

   - Verify: http://localhost:8000/api/v1/health returns 200 OK

2. **Frontend Running**

   ```bash
   cd apps/web
   npm run dev
   ```

   - Verify: http://localhost:3000 loads successfully

3. **Environment Variables**
   - Backend: `.env` file with Supabase credentials, OpenAI API key
   - Frontend: `NEXT_PUBLIC_PNLD_AI_SERVICE_URL=http://localhost:8000`

4. **Test Files**
   - Prepare valid PDF files (< 50MB)
   - Prepare invalid files (non-PDF, > 50MB)

---

## Test Scenario 1: Document Upload Flow

### 1.1 Upload Valid PDF File

**Steps:**

1. Navigate to `/pnld-chat/dashboard`
2. Click "Fazer Upload de Documento" or drag-and-drop zone
3. Select a valid PDF file (< 50MB)
4. Enter edital ID (optional)
5. Click "Upload" or submit

**Expected Results:**

- ✅ Upload progress indicator appears
- ✅ Progress bar shows 0% → 100%
- ✅ Success message displays
- ✅ Document appears in the documents list
- ✅ Document shows correct file name, size, and upload date
- ✅ Processing status shown (if applicable)

**Verification in Database:**

```sql
-- Check document was created
SELECT * FROM pnld_documents ORDER BY created_at DESC LIMIT 1;

-- Check embeddings were created
SELECT COUNT(*) as chunk_count FROM pnld_embeddings
WHERE document_id = '<document_id_from_above>';
```

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 1.2 Reject Non-PDF Files

**Steps:**

1. Navigate to `/pnld-chat/dashboard`
2. Try to upload a non-PDF file (e.g., .docx, .txt, .jpg)

**Expected Results:**

- ✅ File validation error appears
- ✅ Error message: "Only PDF files are supported" (or similar)
- ✅ Upload does not proceed
- ✅ No document created in database

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 1.3 Reject Files > 50MB

**Steps:**

1. Navigate to `/pnld-chat/dashboard`
2. Try to upload a PDF file larger than 50MB

**Expected Results:**

- ✅ File size validation error appears
- ✅ Error message indicates file size limit
- ✅ Upload does not proceed
- ✅ No document created in database

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 1.4 Upload Progress Indicator

**Steps:**

1. Navigate to `/pnld-chat/dashboard`
2. Upload a medium-sized PDF (5-10MB) to observe progress
3. Watch the upload progress indicator

**Expected Results:**

- ✅ Progress bar appears immediately
- ✅ Progress updates smoothly from 0% to 100%
- ✅ Percentage text updates
- ✅ Loading spinner or animation shows
- ✅ UI remains responsive during upload

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 1.5 Document Appears in List After Upload

**Steps:**

1. Note the current number of documents
2. Upload a new PDF document
3. Wait for upload completion
4. Check the documents list

**Expected Results:**

- ✅ Document count increases by 1
- ✅ New document appears at the top of the list (most recent first)
- ✅ Document metadata is correct:
  - File name matches uploaded file
  - File size is accurate
  - Upload timestamp is current
  - Edital ID (if provided) is shown
- ✅ Document status shows as processed/ready

**Pass/Fail:** \***\*\_\_\_\*\***

---

## Test Scenario 2: Chat Flow

### 2.1 Send First Message (New Conversation)

**Steps:**

1. Navigate to `/pnld-chat`
2. Clear localStorage (or use incognito window)
3. Type a message: "O que é PNLD?"
4. Send the message

**Expected Results:**

- ✅ User message appears immediately in chat
- ✅ Typing indicator appears for assistant
- ✅ Tokens stream in progressively (word by word)
- ✅ Typing indicator disappears once first token arrives
- ✅ Complete response appears
- ✅ Response time < 5 seconds for first token
- ✅ Conversation ID saved to localStorage

**Verification:**

```javascript
// Check localStorage
localStorage.getItem("pnld_conversation_id");
// Should return a UUID
```

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 2.2 Streaming Works Correctly

**Steps:**

1. Send a message that will generate a long response
2. Watch the response stream in

**Expected Results:**

- ✅ Response appears token by token (not all at once)
- ✅ Tokens appear smoothly without lag
- ✅ Message content updates progressively
- ✅ No flickering or jumping of UI
- ✅ Scroll stays at bottom as content streams
- ✅ Each token is appended to previous content

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 2.3 Sources/Citations Display Correctly

**Steps:**

1. Send a message that will return document sources
2. Wait for streaming to complete
3. Check the sources section below the response

**Expected Results:**

- ✅ Sources section appears after message completes
- ✅ Shows "📄 Fontes Oficiais (N)" header
- ✅ Each source displays:
  - Document title
  - Page number badge
  - Content excerpt (truncated to 2 lines)
  - Relevance percentage
  - Chunk index (if available)
- ✅ If > 3 sources, shows "Ver todas" button
- ✅ Expand/collapse works correctly

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 2.4 Follow-up Message (Same Conversation)

**Steps:**

1. After sending first message, send a follow-up
2. Example: "Me dê mais detalhes sobre isso"
3. Check that context is maintained

**Expected Results:**

- ✅ Follow-up message references previous context
- ✅ Same conversation_id in localStorage
- ✅ Both messages appear in chat history
- ✅ Streaming works for follow-up message
- ✅ Sources may appear for follow-up response

**Verification in Database:**

```sql
-- Check messages in same conversation
SELECT role, content, created_at FROM chat_messages
WHERE conversation_id = '<conversation_id>'
ORDER BY created_at;
```

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 2.5 Conversation ID Persists

**Steps:**

1. Send a message and note the conversation_id
2. Refresh the page
3. Send another message

**Expected Results:**

- ✅ Same conversation_id used after refresh
- ✅ Previous messages NOT shown (this is expected - no history loading yet)
- ✅ New message continues same conversation in backend
- ✅ Context is maintained in backend

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 2.6 Test With No Documents

**Steps:**

1. Ensure database has no documents OR use empty edital_id
2. Send a message asking about documents
3. Example: "O que diz o edital sobre X?"

**Expected Results:**

- ✅ Response is generated (doesn't crash)
- ✅ AI indicates no relevant documents found OR provides general response
- ✅ Sources section either:
  - Doesn't appear, OR
  - Shows "Nenhuma fonte encontrada"
- ✅ No errors in console
- ✅ User can continue chatting

**Pass/Fail:** \***\*\_\_\_\*\***

---

## Test Scenario 3: Document Management Flow

### 3.1 List All Documents

**Steps:**

1. Navigate to `/pnld-chat/dashboard`
2. Verify documents list loads

**Expected Results:**

- ✅ All documents display in a list/grid
- ✅ Shows document metadata:
  - Title/filename
  - File size
  - Upload date
  - Edital ID (if applicable)
  - Chunk count
- ✅ List is sorted by most recent first
- ✅ Loading state shows while fetching
- ✅ Empty state shows if no documents

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 3.2 Filter by Edital ID

**Steps:**

1. Upload documents with different edital_ids
2. Use edital_id filter/selector
3. Select a specific edital_id

**Expected Results:**

- ✅ Only documents with selected edital_id show
- ✅ Document count updates correctly
- ✅ Can clear filter to show all documents
- ✅ Filter persists across page refreshes (if implemented)

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 3.3 View Document Details

**Steps:**

1. Click on a document in the list
2. View the document detail page/modal

**Expected Results:**

- ✅ Document details page/modal opens
- ✅ Shows all metadata:
  - Full filename
  - File size
  - Upload timestamp
  - Processing status
  - Edital ID
  - Chunk count
- ✅ Shows chunk information (if available)
- ✅ Can navigate back to list

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 3.4 Delete Document

**Steps:**

1. Select a document to delete
2. Click delete button
3. Confirm deletion

**Expected Results:**

- ✅ Confirmation dialog appears
- ✅ User must confirm deletion
- ✅ After confirmation:
  - Success message appears
  - Document removed from list
  - Document count decreases
- ✅ Can cancel without deleting

**Verification in Database:**

```sql
-- Check document was deleted
SELECT * FROM pnld_documents WHERE id = '<document_id>';
-- Should return no rows

-- Check embeddings were also deleted
SELECT COUNT(*) FROM pnld_embeddings WHERE document_id = '<document_id>';
-- Should return 0
```

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 3.5 Deletion Cascades to Embeddings

**Steps:**

1. Upload a document and note its ID
2. Verify embeddings exist
3. Delete the document
4. Check database

**Expected Results:**

- ✅ Document deleted from `pnld_documents` table
- ✅ All related rows deleted from `pnld_embeddings` table
- ✅ No orphaned embeddings remain

**Verification:**

```sql
-- Before deletion
SELECT COUNT(*) FROM pnld_embeddings WHERE document_id = '<document_id>';

-- After deletion (should be 0)
SELECT COUNT(*) FROM pnld_embeddings WHERE document_id = '<document_id>';
```

**Pass/Fail:** \***\*\_\_\_\*\***

---

## Test Scenario 4: Error Handling

### 4.1 Backend Offline

**Steps:**

1. Stop the backend server
2. Try to send a chat message
3. Try to upload a document
4. Try to load documents list

**Expected Results:**

- ✅ Chat: Error message displays (e.g., "Não foi possível enviar a mensagem")
- ✅ Upload: Error message displays
- ✅ List: Error state or empty state shows
- ✅ No JavaScript errors in console (errors are handled gracefully)
- ✅ User can retry after backend comes back online

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 4.2 Invalid Conversation ID

**Steps:**

1. Manually set localStorage conversation_id to invalid UUID
   ```javascript
   localStorage.setItem("pnld_conversation_id", "invalid-uuid-12345");
   ```
2. Send a chat message

**Expected Results:**

- ✅ Backend handles invalid ID gracefully
- ✅ Either:
  - Creates new conversation, OR
  - Returns error and creates new conversation
- ✅ User can continue chatting
- ✅ Valid conversation_id is set

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 4.3 Network Timeout

**Steps:**

1. Use browser DevTools to simulate slow 3G network
2. Send a chat message
3. Upload a document

**Expected Results:**

- ✅ Loading states show appropriately
- ✅ Timeout error appears after reasonable time (e.g., 30s)
- ✅ User can retry
- ✅ No hanging requests
- ✅ UI remains responsive

**Pass/Fail:** \***\*\_\_\_\*\***

---

### 4.4 Malformed Response

**Steps:**

1. This requires backend to send malformed data (testing only)
2. Or use browser DevTools to intercept and modify response
3. Send a chat message

**Expected Results:**

- ✅ Error is caught and handled
- ✅ Error message displays to user
- ✅ Application doesn't crash
- ✅ User can send another message
- ✅ Console shows descriptive error (for debugging)

**Pass/Fail:** \***\*\_\_\_\*\***

---

## Cross-Browser Testing

Test all critical flows in:

### Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers

- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

**Issues Found:**

- ***
- ***

---

## Performance Testing

### Response Time Benchmarks

| Action                 | Expected Time | Actual Time | Pass/Fail |
| ---------------------- | ------------- | ----------- | --------- |
| Page load              | < 2s          | **\_**      | **\_**    |
| First chat token       | < 3s          | **\_**      | **\_**    |
| Complete chat response | < 10s         | **\_**      | **\_**    |
| Document upload (5MB)  | < 5s          | **\_**      | **\_**    |
| Documents list load    | < 1s          | **\_**      | **\_**    |

---

## Security Testing

### Input Validation

- [ ] SQL injection attempts in chat input
- [ ] XSS attempts in chat input
- [ ] Malicious file upload attempts
- [ ] Oversized payloads
- [ ] Special characters in edital_id

**Issues Found:**

- ***
- ***

---

## Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility (NVDA/JAWS)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels and ARIA attributes present

**Issues Found:**

- ***
- ***

---

## Regression Testing

After each deployment, verify:

- [ ] Existing conversations still work
- [ ] Previously uploaded documents still accessible
- [ ] No data loss
- [ ] All critical paths still functional

---

## Test Summary

**Test Date:** **\*\*\*\***\_\_\_**\*\*\*\***
**Tester:** **\*\*\*\***\_\_\_**\*\*\*\***
**Build/Version:** **\*\*\*\***\_\_\_**\*\*\*\***
**Environment:** [ ] Local [ ] Staging [ ] Production

**Total Tests:** **\_**
**Passed:** **\_**
**Failed:** **\_**
**Blocked:** **\_**

**Overall Result:** [ ] PASS [ ] FAIL

**Critical Issues Found:**

1. ***
2. ***
3. ***

**Notes:**

---

---

---

---

## Automated Test Coverage

For future implementation:

### Unit Tests

- [ ] API client functions (`pnld-chat.ts`)
- [ ] React hooks (`usePnldChat.ts`, `useDocumentUpload.ts`)
- [ ] Component rendering (Message, SourceCitation, etc.)

### Integration Tests

- [ ] Chat flow with mocked backend
- [ ] Document upload flow with mocked backend
- [ ] Error handling scenarios

### E2E Tests (Playwright/Cypress)

- [ ] Complete chat conversation flow
- [ ] Document upload → chat with document
- [ ] Multi-message conversation
- [ ] Error recovery flows

**Test files to create:**

- `apps/web/__tests__/unit/pnld-chat.test.ts`
- `apps/web/__tests__/integration/chat-flow.test.tsx`
- `apps/web/__tests__/e2e/pnld-chat.spec.ts`
