---
name: frontend-design
description: >
  Design system setup and UI implementation guidance for this project.
  Load when building new UI components, setting up design tokens, implementing
  animations or visual effects, or making aesthetic and layout decisions.
  Covers Tailwind CSS v4 @theme token structure, typography, color, motion,
  and visual design direction.
---

# Frontend Design

## Design Thinking

Before coding, commit to a clear aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick a direction and execute with precision — brutally minimal, maximalist, retro-futuristic, editorial, brutalist, soft/pastel, luxury/refined, etc.
- **Differentiation**: What makes this memorable?

Bold maximalism and refined minimalism both work. The key is intentionality, not intensity.

## Tailwind CSS v4 — Token Setup

```css
/* globals.css */
@import "tailwindcss";

@theme inline {
  /* Colors */
  --color-primary-500: #0ea5e9;
  --color-success: #10b981;
  --color-error: #ef4444;

  /* Typography */
  --font-display: "YourDisplayFont", sans-serif;
  --font-body: "YourBodyFont", sans-serif;
}
```

- Define all tokens here — this is the single source of truth for the design system
- Use semantic naming (`--color-success`, not `--color-green`)
- Ensure contrast ratios: 4.5:1 for text, 3:1 for UI components

## Typography

- Pair a distinctive display font with a refined body font
- Avoid generic fonts: Inter, Roboto, Arial, system-ui
- Unexpected, characterful font choices elevate the interface

## Color

- Dominant colors with sharp accents outperform evenly-distributed palettes
- Commit to a cohesive palette — never mix unrelated aesthetic directions

## Motion

- CSS-only animations preferred over JS where possible
- A single well-composed page load with staged reveals (animation-delay) delivers more delight than scattered microinteractions
- Use scroll triggers and hover states for surprise effects
- Never animate for the sake of animation — motion should reinforce meaning

## Backgrounds & Visual Depth

Create atmosphere with: gradient meshes, noise textures, geometric patterns,
layered transparencies, dramatic shadows, decorative borders, grain overlays.
Match the technique to the aesthetic direction — don't mix unrelated effects.

## Anti-patterns

- Generic AI aesthetics: purple gradients on white, cookie-cutter layouts
- Hardcoded hex/rgb values outside `@theme`
- `!important`
- Duplicating Tailwind utilities in custom CSS
