# PNLD Chat UI Components

Complete chat interface implementation based on Figma design (node-id: 357-766).

## Components

### ChatInterface (Main Container)

Main orchestrator component that manages the chat state and coordinates all sub-components.

**Props:**

- `selectedEdital`: Currently selected edital ID
- `onEditalSelect`: Callback for edital selection
- `onSendMessage`: Async handler for sending messages

**Features:**

- Message state management
- Typing indicator control
- Empty state handling
- Full-height responsive layout

### Header

Top navigation bar with branding and edital selector (no menu).

**Props:**

- `selectedEdital`: Current edital selection
- `onEditalSelect`: Edital selection callback
- `availableEditais`: Array of available editais

**Features:**

- MokLabs branding with logo + "| Copiloto PNLD" title
- Dropdown edital selector (replaces menu on right side)
- Responsive design (mobile/desktop)
- Keyboard accessible

### EmptyState

Initial welcome screen shown before any messages.

**Props:**

- `selectedEdital`: Current edital selection
- `onSuggestedQuestionClick`: Handler for suggested questions

**Features:**

- Avatar display with circular images
- Welcome message with branding
- Suggested questions (3 pre-defined)
- Warning when no edital selected
- Fully responsive

### MessageList

Scrollable container for chat messages.

**Props:**

- `messages`: Array of message objects
- `isTyping`: Boolean for typing indicator

**Features:**

- Auto-scroll to bottom on new messages
- Smooth scrolling animation
- ARIA live region for accessibility
- Handles empty state

### Message

Individual message bubble for user/assistant.

**Props:**

- `role`: 'user' | 'assistant'
- `content`: Message text
- `sources`: Optional array of document sources
- `timestamp`: Optional message timestamp

**Features:**

- Different styling for user/assistant
- Multi-line text support
- Source citations (assistant only)
- Timestamp display
- Responsive width (70% max-width)

### MessageInput

Input field with send button at bottom.

**Props:**

- `onSendMessage`: Message submission handler
- `disabled`: Input disabled state
- `placeholder`: Optional placeholder text

**Features:**

- Text input with border styling
- Enter key submission
- Disabled state when no edital selected
- Visual feedback on hover/active
- Disclaimer text
- Keyboard accessible

### TypingIndicator

Animated "typing" indicator for AI response.

**Features:**

- Three bouncing dots animation
- Staggered animation timing
- "Copiloto está digitando..." text
- Matches assistant message styling

### SourceCitation

Displays document sources with citations.

**Props:**

- `sources`: Array of source documents

**Features:**

- Expandable source list (shows 3, expandable to all)
- Document title and excerpt
- Page number badges
- Relevance score display
- Chunk index information
- Responsive cards

### CompactFooter

Simplified footer with contact icons and privacy policy link.

**Features:**

- White background (contrasts with blue chat input)
- Contact icons only (WhatsApp, Email, Instagram)
- Privacy policy link
- Copyright notice
- Compact single-row layout
- Responsive design

## Design System

### Colors

- Primary Blue: `#0013ff`
- Accent Yellow/Green: `#cbff63` / `#ccff73`
- White: `#ffffff`
- Gray variants for borders/backgrounds

### Typography (Fira Code)

- **H2 (24px, Bold)**: Headings, line-height 1.2
- **Body P1 (16px, Regular)**: Body text, line-height 1.4
- **Button (16px, Bold)**: Buttons, line-height 1.2
- **Caption P2 (12px, Regular)**: Small text, line-height 1.4

### Spacing

- Component gaps: 16px, 24px, 32px
- Padding: 16px (mobile), 32px-128px (desktop)
- Border radius: 16px (small), 24px (large)

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader friendly

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible layouts with Tailwind
- Touch-friendly targets (44px minimum)

## Next Steps (MOK-33)

This implementation includes UI components only. The next ticket will add:

- API integration with PNLD AI service
- Real-time message streaming
- Conversation persistence
- Error handling and retry logic
- Loading states
- Message history

## Usage Example

```tsx
import { ChatInterface, Header, CompactFooter } from "@/components/pnld-chat";

export default function ChatPage() {
  const [selectedEdital, setSelectedEdital] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        selectedEdital={selectedEdital}
        onEditalSelect={setSelectedEdital}
        availableEditais={EDITAIS}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatInterface
          selectedEdital={selectedEdital}
          onEditalSelect={setSelectedEdital}
          onSendMessage={handleSend}
        />
      </div>
      <CompactFooter />
    </div>
  );
}
```

## Assets Required

The following Figma assets are used:

- Logo SVG: `ef0506ed016aa13598712c377a66cc7c5637ea0e.svg`
- Avatar images: `eefa2557611fd660f2cce9c627ec7249b4224f49.png`, `c7949993cbf057cec7d1d2befb18dbc9246bc768.png`
- Chevron icon: `aba3e76b37cdb597389d69fbbc0f523ccd38b66e.svg`
- Warning icon: `4a4eb96308682e17abfbbc706b848f44fbbbd6ce.svg`

All assets are stored in `/public/figma-assets/`.
