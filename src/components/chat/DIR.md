# /src/components/chat/

Chat UI components for the in-app AI assistant conversation interface.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `chat-fab.tsx` | Floating action button (bottom-right) that opens the chat overlay, hidden when overlay is open | initial · 2026-03-30 |
| `chat-header.tsx` | Chat panel header showing assistant name, online/typing status, and "Web" badge | initial · 2026-03-30 |
| `chat-input.tsx` | Auto-resizing textarea with Enter-to-send and shift+Enter for newlines | initial · 2026-03-30 |
| `chat-message-list.tsx` | Scrollable message list with auto-scroll on new messages and infinite scroll for history | initial · 2026-03-30 |
| `chat-message.tsx` | Single message bubble with user/assistant alignment, agent-type badge, and relative timestamps | initial · 2026-03-30 |
| `chat-overlay.tsx` | Responsive chat panel: bottom Drawer on mobile, right-side Sheet on desktop, loads messages on open | initial · 2026-03-30 |
| `chat-typing-indicator.tsx` | Animated three-dot bounce indicator shown while assistant is responding | initial · 2026-03-30 |
| `chat-view.tsx` | Full chat view composing header, message list, and input with message fetching and send logic via backend API | initial · 2026-03-30 |
