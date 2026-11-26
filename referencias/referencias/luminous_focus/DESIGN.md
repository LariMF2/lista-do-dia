---
name: Luminous Focus
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#c3c0ff'
  on-secondary: '#1f00a4'
  secondary-container: '#3a2dc2'
  on-secondary-container: '#b4b0ff'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#f751a1'
  on-tertiary-container: '#570032'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#372abf'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-inline:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system drives a high-performance, focused task management experience balancing precision utility with vibrant visual pleasure. The interface evokes quiet mastery, kinetic momentum, and modern sophistication—mirroring the clarity and bespoke craft found in tools like Linear, Craft, and Raycast.

The visual direction merges **Refined Glassmorphism** with **Technical Minimalism**:
- **Atmospheric Backgrounds:** Deep mesh color fields subtle enough to sit beneath dense interactive workflows without causing visual strain.
- **Translucent Layering:** High-clarity frosted panels, 1px perimeter highlights, and delicate atmospheric glows that designate elevated work surfaces.
- **Tactile Precision:** Sharp micro-interactions, distinct hover states, micro-glows, and crisp typographical hierarchy designed for rapid keyboard navigation and fluid tactile use.

## Colors

The palette relies on a deep slate foundation enriched by energetic indigo and violet spectral layers, punctuated by vivid accents for prioritization and status tracking.

- **Primary (`#6366F1`):** Electric Indigo. Used for focal interactive actions, active task states, selection rings, and key callouts.
- **Secondary (`#4338CA`):** Deep Iris. Powers structural gradients, active pressed states, and background luminosity anchors.
- **Tertiary (`#EC4899`):** Radiant Fuchsia. Reserved for critical priority indicators, urgent deadlines, and accent highlights.
- **Neutral (`#0F172A`):** Deep Obsidian Slate. Forms the primary canvas backing, surface foundations, and structural framing.

### Semantic Tones & Status
- **Success (`#10B981`):** Completed states, verified checks, positive progress meters.
- **Warning (`#F59E0B`):** Due soon, blocked tasks, intermediate attention tags.
- **Surface Elevation Mix:** Neutral slate mixed with translucent alpha channels (`rgba(15, 23, 42, 0.7)` to `rgba(30, 41, 59, 0.6)`) to preserve atmospheric mesh visibility.

## Typography

Typographic hierarchy is achieved using Inter exclusively. The typeface provides structural neutrality, clear tabular figures for dates and times, and sharp readability across tight density levels.

- **Weight Hierarchy:** Bold weights (`700` and `600`) are reserved for page anchors, view transitions, and panel headers. Medium (`500`) handles interactive metadata, badges, and labels. Regular (`400`) carries all long-form notes and task descriptions.
- **Tight Tracking:** Negative letter-spacing is applied systematically to sizes `14px` and above to reinforce an engineered, modern interface aesthetic.
- **Metadata Labels:** `label-sm` utilizes uppercase rendering with a `0.04em` track to enhance legibility in keyboard shortcut badges and status pills.

## Layout & Spacing

The layout utilizes a structured fluid grid paired with modular fixed-width flyouts and command surfaces.

- **Grid Architecture:** Desktop views balance a fixed left navigation sidebar (240px–280px) against a 12-column dynamic work canvas. Gutter spacing shifts from `1rem` on compact devices to `1.5rem` on large canvases.
- **Canvas Margins:** Safe margins range from `1rem` on mobile viewports to `2rem` on wide displays, ensuring views float seamlessly above the background mesh gradients.
- **Density Rhythm:** Component internal padding adheres to an 8pt modular rhythm (supplemented by a 4pt micro-scale for badges, tooltips, and compact list rows).
- **Responsive Adaptations:**
  - *Mobile (< 768px):* Single column stream; fixed sidebars collapse into quick-drawer sheets; secondary metadata hidden under expandable taps.
  - *Tablet (768px - 1024px):* Collapsible icon-rail navigation, 2-column dashboard splits.
  - *Desktop (> 1024px):* Full persistent workspace with side-by-side task list and context pane.

## Elevation & Depth

Visual depth combines physical layering, luminous glassmorphism, and colored edge diffusion rather than heavy dark shadows.

- **Backdrop Filters:** Glass panels use `backdrop-filter: blur(16px)` to `blur(24px)` coupled with background fills of `rgba(30, 41, 59, 0.45)`.
- **Perimeter Edge Lit Borders:** Panels feature a `1px` inner boundary (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.16)`) to catch phantom light from the top and sides, mimicking refined hardware chamfers.
- **Ambient Glows:** Floating modals, command palettes, and active cards cast diffuse color fields:
  - *Layer 1 (Card Rest):* 0px 4px 20px -2px rgba(0, 0, 0, 0.4).
  - *Layer 2 (Elevated Card / Flyout):* 0px 12px 36px -4px rgba(0, 0, 0, 0.5), 0px 0px 18px 0px rgba(99, 102, 241, 0.12).
  - *Layer 3 (Modal / Palette):* 0px 24px 64px -8px rgba(0, 0, 0, 0.7), 0px 0px 32px 0px rgba(99, 102, 241, 0.22).
- **Surface Hierarchy:** The further forward an element sits in the Z-plane, the lighter and more transparent its background blend becomes, paired with increased backdrop blur.

## Shapes

The design system embraces a **Rounded (Level 2)** shape language, balancing soft organic surfaces with precise geometry:

- **Base Elements (`0.5rem` / 8px):** Applied to input fields, list item hover states, menu selections, and compact buttons.
- **Mid Surfaces (`rounded-lg` - `1rem` / 16px):** Applied to cards, task group containers, flyout drawers, and popover menus.
- **Hero Containers (`rounded-xl` - `1.5rem` / 24px):** Applied to command menus, central modal overlays, and elevated primary panels.
- **Pill Profiles (`9999px`):** Reserved exclusively for status indicators, tag badges, count chips, and keyboard shortcut glyphs.

## Components

### Buttons
- **Primary:** Gradient fill from `#6366F1` to `#4338CA`. Subtle top-border highlight (`rgba(255, 255, 255, 0.25)`). Focus-visible displays a `2px` offset ring in `#6366F1`. Includes an ambient glow (`box-shadow: 0 0 16px rgba(99, 102, 241, 0.35)`) on hover.
- **Secondary / Ghost:** Glass surface fill `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`. On hover, background shifts to `rgba(255, 255, 255, 0.1)`.

### Cards & Panels
- **Container:** Backed by `backdrop-filter: blur(20px)` over `rgba(15, 23, 42, 0.6)`. Outlined with `1px solid rgba(255, 255, 255, 0.08)`.
- **Interactive State:** Hover transitions border brightness to `rgba(99, 102, 241, 0.4)` with an elevation bump and inner edge illumination.

### Input Fields
- **Default:** Recessed glass fill `rgba(15, 23, 42, 0.4)`, `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`, placeholder `#64748B`.
- **Active / Focus:** Border switches to `#6366F1`, backfilled with a subtle radial flare `box-shadow: 0 0 0 1px #6366F1, 0 0 12px rgba(99, 102, 241, 0.25)`.

### Task List Rows
- **Layout:** Horizontal alignment containing completion checkbox, title, tags, date indicator, and assignment avatar.
- **States:** Hover displays a floating background `rgba(255, 255, 255, 0.04)` with rounded corners. Selected rows display an indigo left border tab (3px) and background `rgba(99, 102, 241, 0.08)`.

### Checkboxes & Radio Buttons
- **Checkbox:** `18px` square, `4px` radius, `1px solid rgba(255, 255, 255, 0.2)`. On check: filled with `#6366F1` displaying an animated SVG checkmark in white with a quick scale-spring transition.
- **Radio:** `18px` circular, matching state logic with a center solid `#6366F1` pip.

### Chips, Tags & Indicators
- **Priority Tags:** Pill shape, padding `2px 8px`, `label-sm`. Low priority: soft slate with gray dot; Medium: amber tint `rgba(245, 158, 11, 0.15)` with amber text; High/Urgent: tertiary fuchsia tint `rgba(236, 72, 153, 0.15)` with `#EC4899` text and subtle pulse indicator.
- **Category Chips:** Translucent dark base, `1px solid rgba(255, 255, 255, 0.08)`, colored icon accent.

### Command Palette (Raycast / Linear style)
- **Container:** Large centralized overlay (`rounded-xl`), blur `32px`, top search bar with large body text, keyboard navigation indices, clear sub-section dividers, and key combination shortcut badges on the right rail.