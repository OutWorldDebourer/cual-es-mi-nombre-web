# /src/components/chat/

Chat UI components for the in-app AI assistant conversation interface.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `chat-fab.tsx` | Floating action button (bottom-right) that opens the chat overlay, hidden when overlay is open | initial · 2026-03-30 |
| `chat-header.tsx` | Chat panel header showing assistant name, online/typing status, and "Web" badge | initial · 2026-03-30 |
| `chat-input.tsx` | Auto-resizing textarea with Enter-to-send and shift+Enter for newlines | initial · 2026-03-30 |
| `chat-message-list.tsx` | Scrollable message list with AnimatePresence, auto-scroll on new messages, and infinite scroll for history; tracks static vs real-time messages for animation gating | T7 · 2026-04-01 |
| `chat-message.tsx` | Single message bubble (motion.div) with spring entrance animation (user from right, assistant from left), agent-type badge, relative timestamps, and useReducedMotion support | T7 · 2026-04-01 |
| `chat-overlay.tsx` | Responsive chat panel: bottom Drawer on mobile, right-side Sheet on desktop, loads messages on open | initial · 2026-03-30 |
| `chat-typing-indicator.tsx` | Three-dot typing indicator using custom typing-bounce keyframe (subtle translateY) with staggered delays | T7 · 2026-04-01 |
| `chat-view.tsx` | Full chat view composing header, message list, and input with message fetching and send logic via backend API | initial · 2026-03-30 |
