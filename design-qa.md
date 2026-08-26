# Design QA — 编辑用户信息级联选择

- Source visual truth: `source-edit-user.png`
- Rendered implementation: `implementation-full.png`
- Browser viewport: 1600 × 1000 CSS px
- Source pixels: 1512 × 616 px; treated as an approximately 2× focused crop (normalized target about 756 × 308 CSS px)
- Implementation pixels: 1572 × 1000 px; edit form region measured at 736 × 378 CSS px
- State: 中文界面 / 编辑用户信息 / 当前信息页签 / 默认 NISSAN 线索

## Full-view comparison evidence

The implementation preserves the reference modal hierarchy, tab treatment, pale information notice, two-column field grid, input heights, border color, typography hierarchy, and bottom-right actions. The implementation is intentionally taller because the requested dealer field and automatically populated region/address row add one field row.

## Focused region comparison evidence

The source crop and the rendered edit form were inspected together. Brand, series, and model retain the same field dimensions and alignment while changing from text inputs to native selects. Dealer uses an input with browser-native autocomplete suggestions. Region and address use the same control dimensions with a muted read-only treatment so their system-populated status is visible.

## Required fidelity surfaces

- Fonts and typography: existing system font stack, weights, sizes, and hierarchy are preserved. No actionable mismatch.
- Spacing and layout rhythm: two-column grid, notice spacing, field gaps, radii, and action alignment match the existing modal. Extra vertical height is required by the added dealer/location fields.
- Colors and visual tokens: existing navy, gray, border, focus, and disabled tokens are reused. Read-only fields have sufficient contrast.
- Image quality and assets: the reference contains no raster UI assets requiring recreation.
- Copy and content: new labels and helper text reflect the requested cascade and dealer lookup behavior; Chinese and Mexican Spanish keys are complete.

## Primary interactions tested

1. Brand NISSAN → MAZDA refreshes series to CX-30/CX-5 and models to the selected series options.
2. Dealer suggestions filter to the selected brand.
3. Selecting Mazda Interlomas automatically fills Estado de México and Vialidad de la Barranca 6.
4. Saving updates brand, series, model, dealer, region, and address on the workbench.
5. The edit history records all six changed fields with operator information.
6. Invalid free text is rejected unless it matches a dealer in the suggestion list.
7. Mobile viewport 390 × 844 has no horizontal overflow; dialog width is 358 px and the form becomes one column.
8. Browser console error count: 0.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- P3: the native datalist suggestion popup appearance can vary slightly between browsers. This does not affect the interaction or saved result.

## Comparison history

- Pass 1: no P0/P1/P2 issues found. The intentional extra row was verified against the new functional requirement. No visual correction loop was required.

## Implementation checklist

- [x] Vehicle brand/series/model cascade
- [x] Dealer autocomplete and brand filtering
- [x] Automatic read-only region/address population
- [x] Save and edit-history integration
- [x] Chinese and Mexican Spanish UI labels
- [x] Desktop and mobile validation

final result: passed
