# UI / UX Guidelines

## Design Principles

- Clean
- Modern
- Minimal
- Mobile-first
- Accessible
- Fast
- Trustworthy

## Language and Locale

- Bilingual UI: Bengali (bn) + English (en), switchable from the header
- All text through the i18n layer — no hardcoded strings
- Prices in BDT with ৳ symbol
- Bengali numerals optional; default to Western numerals for prices and quantities

## Typography

- English: Inter (or system font stack)
- Bengali: Noto Sans Bengali — must render cleanly at all sizes
- Clear hierarchy
- Readable font sizes (16px minimum body on mobile)
- Consistent spacing scale (Tailwind spacing tokens only)

## Theming

- shadcn/ui theme tokens via CSS variables — single source of truth for colors
- Light theme first; dark mode optional later (tokens make it cheap)
- Brand colors defined once in the Tailwind/shadcn theme config, never hardcoded hex in components

## Components

- Reusable buttons
- Reusable forms (React Hook Form + Zod, consistent error display)
- Reusable cards
- Reusable modals
- Reusable tables
- Reusable alerts
- Every component supports loading, empty, and error states

## Layout Patterns

- Breadcrumbs on category and product pages
- Sticky mobile cart/checkout bar where useful
- Skeleton loaders instead of spinners for content areas
- Product images: fixed aspect ratio containers to avoid layout shift

## Checkout UX

- Minimal steps
- Clear progress indicator
- Large touch targets (44px minimum)
- Fast mobile experience
- Clear payment instructions (especially bKash/Nagad/Rocket flows)
- Guest checkout prominent — never force account creation

## Accessibility

- WCAG AA
- Keyboard navigation everywhere
- Visible focus states
- Proper contrast (4.5:1 body text)
- Semantic HTML first, ARIA only when needed
- Alt text required on all product images (managed via media manager)
