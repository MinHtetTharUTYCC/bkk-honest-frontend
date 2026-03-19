# UI Style Update: TipCard Arc

## Date: 2026-03-19
## Status: Implemented

### Files Touched
- `src/components/tips/tip-card.tsx`

### Core Logic Changed
- **Neutral Background:** Changed from full-width `bg-red/emerald-500/10` to a consistent subtle `bg-white/[0.03]`.
- **Corner Arc Decoration:** Added a 1/4 circle (arc) in the **top-left** corner behind the user avatar.
- **Improved Contrast:** Increased border opacity to `/30` to maintain card distinctness without overwhelming the user.
- **Layering:** Wrapped content in `relative z-10` to ensure text/actions remain interactive above the background decoration.

### Key Code Snippet
```tsx
{/* The Corner Arc Decoration (Final Small Size) */}
<div className="absolute top-0 left-0 w-12 h-12 pointer-events-none overflow-hidden z-0">
  <div 
    className={cn(
      "absolute inset-0 transition-colors duration-500",
      tip.type === 'AVOID' ? "bg-red-500/15" : "bg-emerald-500/15"
    )}
    style={{ clipPath: 'circle(100% at 0% 0%)' }}
  />
  <div 
    className={cn(
      "absolute -top-6 -left-6 w-16 h-16 blur-2xl opacity-20",
      tip.type === 'AVOID' ? "bg-red-500" : "bg-emerald-500"
    )}
  />
</div>
```
