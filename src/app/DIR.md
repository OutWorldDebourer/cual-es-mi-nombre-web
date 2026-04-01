# /src/app/

Next.js App Router root. Contains global styles, layout, and route groups.

## Key Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `globals.css` | Design system tokens (OKLCh), light/dark themes, keyframe animations including shimmer, stagger-children, floating orbs | T3 · 2026-03-31 |
| `layout.tsx` | Root layout with fonts, theme provider, Toaster | initial · 2026-03-30 |
| `not-found.tsx` | 404 page with FloatingOrbs, MotionReveal entrance, spring scale-in on "404" number | T11 · 2026-04-01 |
| `error.tsx` | Error boundary page with FloatingOrbs, MotionReveal entrance, pulse-glow on icon; preserves `reset()` | T11 · 2026-04-01 |
| `page.tsx` | Landing page — hero, features, how-it-works, pricing, footer. FloatingOrbs(count=2) on features/how-it-works/pricing sections | T14 · 2026-04-01 |
