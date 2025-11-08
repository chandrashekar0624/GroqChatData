# Design Guidelines: Analytics Dashboard AI Chat Integration

## Design Approach
**Selected System**: shadcn/ui with Radix UI primitives (maintain consistency with existing dashboard)

**Rationale**: This is a utility-focused, information-dense analytics application where consistency, readability, and efficiency are paramount. Continuing with your established shadcn/ui system ensures seamless integration with existing dashboard components.

---

## Core Design Principles

1. **Data Clarity First**: SQL code and query results must be immediately scannable
2. **Progressive Disclosure**: Show loading states, then SQL, then results in clear hierarchy
3. **Trust & Transparency**: Always display generated SQL before executing (user verification)
4. **Consistency**: Match existing dashboard patterns for navigation, spacing, and component styles

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently
- Component padding: `p-4` to `p-6`
- Section spacing: `gap-6` to `gap-8`
- Container margins: `mb-8` to `mb-12`

**Chat Interface Layout**:
```
┌─────────────────────────────────────┐
│  Dashboard Header (existing)        │
├─────────────────────────────────────┤
│                                     │
│  Chat Container (max-w-4xl mx-auto) │
│  ┌───────────────────────────────┐ │
│  │ Query Input Area              │ │
│  │ (sticky top or prominent)     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Response Display              │ │
│  │ - Generated SQL (code block)  │ │
│  │ - Results Table               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Typography

**Font Stack**: System fonts for optimal performance
- Primary: `font-sans` (default Tailwind system stack)
- Monospace: `font-mono` for SQL code

**Hierarchy**:
- Page Title: `text-2xl font-semibold` (mb-6)
- Section Headers: `text-lg font-medium` (mb-4)
- Body Text: `text-base` (leading-relaxed)
- SQL Code: `text-sm font-mono` (in code blocks)
- Table Headers: `text-sm font-medium`
- Table Data: `text-sm`

---

## Component Library

### Query Input Section
- **Textarea**: shadcn/ui Textarea component
  - Height: `min-h-[100px]`
  - Placeholder: "Ask a question about your data..."
  - Bottom padding: `pb-4` for submit button row
  
- **Submit Button**: shadcn/ui Button (primary variant)
  - Position: Right-aligned below textarea
  - Icon: Optional arrow/send icon from Heroicons
  - States: Default, Loading (spinner), Disabled

### Response Display

**SQL Display**:
- **Container**: shadcn/ui Card component
  - Padding: `p-6`
  - Margin bottom: `mb-6`
  
- **Code Block**: 
  - Background: subtle contrast against card
  - Padding: `p-4`
  - Rounded: `rounded-md`
  - Font: `font-mono text-sm`
  - Max height with scroll: `max-h-[300px] overflow-auto`
  - Copy button: Top-right corner (shadcn/ui Button with ghost variant)

**Results Table**:
- **Container**: shadcn/ui Card component
  - Padding: `p-6`
  
- **Table**: shadcn/ui Table component
  - Sticky header: `thead` with `sticky top-0`
  - Alternating row backgrounds for scannability
  - Max height with scroll: `max-h-[500px] overflow-auto`
  - Cell padding: `px-4 py-3`

### Loading States
- **Query Processing**: shadcn/ui Skeleton or Spinner
  - Position: Center of response area
  - Message: "Generating SQL query..."

### Error States
- **Alert**: shadcn/ui Alert component (destructive variant)
  - Icon: Alert triangle from Heroicons
  - Clear error message with actionable guidance
  - Margin: `mt-4`

---

## Interaction Patterns

**Query Submission**:
1. User types question → Submit button activates
2. Loading state shows → Input disabled during processing
3. SQL appears first → User can review before execution
4. Results render below → Scrollable table if many rows

**Empty State** (first visit):
- Centered content with icon
- Example queries as clickable suggestions (shadcn/ui Button with outline variant)
- Brief instruction text

**Multi-Query History** (optional enhancement):
- Accordion-style previous queries (shadcn/ui Accordion)
- Collapsed by default
- Max 10 recent queries shown

---

## Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation: Tab through input → Submit → Copy SQL → Table scroll
- Focus indicators: Use shadcn/ui default focus rings
- Screen reader announcements for loading/success/error states
- Table semantic markup: `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`

---

## Responsive Behavior

**Desktop (lg+)**: Max-width container `max-w-4xl`, generous spacing
**Tablet (md)**: Reduce spacing to `p-4`, maintain two-column table when possible
**Mobile (base)**: 
- Single column layout
- Reduce textarea height to `min-h-[80px]`
- Table horizontal scroll with sticky first column
- Spacing: `p-3` for cards

---

## Integration with Existing Dashboard

- Match existing dashboard's Card, Button, Input, and Table components exactly
- Use same spacing system throughout
- Maintain consistent navigation patterns
- Respect existing theme/mode toggle (if present)