---
name: Club Administrative Excellence
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e1'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf4'
  surface-container-high: '#e9e7ef'
  surface-container-highest: '#e3e1e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#444651'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f7'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#272b2d'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d4143'
  on-tertiary-container: '#aaadaf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e3e1e9'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-base:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.02em
  table-header:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  table-cell-padding: 0.75rem 1rem
---

## Brand & Style

The design system is engineered for **trust, efficiency, and organizational clarity**. It serves as the bridge between sports club management and financial accountability. The brand personality is institutional yet accessible—evoking the reliability of a community bank with the modern agility of a high-performance SaaS platform.

The visual style is **Corporate / Modern**. It prioritizes a clean, information-dense environment where data integrity is paramount. By utilizing high-quality whitespace and a structured layout, the system ensures that complex data tables and financial records remain legible and actionable for administrators and sellers alike. The goal is an emotional response of security and competence.

## Colors

The palette is anchored by **Athletic Blue (#1E3A8A)**, representing stability and professional tradition. This is paired with a comprehensive set of functional grays to maintain a "clean" interface that doesn't distract from the data.

Drawing directly from the administrative spreadsheet, the system employs a semantic color strategy for status tracking:
- **Green (#B9E6B5):** Full payment / Verified status.
- **Blue (#B5D9F2):** Installment plans / Active processing.
- **Orange (#F9D5AF):** Pending manual verification / Cash transitions.
- **Pink (#F1A7A7):** Discrepancies / Attention required.

These colors should be used as background tints with high-contrast text to ensure accessibility while maintaining the "highlighted" look of the source data.

## Typography

This design system utilizes **Hanken Grotesk** for its exceptional legibility and sharp, contemporary grotesque characteristics. It provides the professional "tech-forward" feel required for modern administration. 

For critical data points—such as ticket numbers (Boleta), dates, and currency values—**JetBrains Mono** is introduced. Its monospaced nature ensures that columns of numbers align perfectly, reducing cognitive load when scanning financial records. Use `table-header` styles for data grids to maximize vertical space and clarity.

## Layout & Spacing

The system follows a **Fixed Grid** model for desktop to ensure data tables don't become overly wide and difficult to read. 
- **Desktop:** A 12-column grid with a 1280px max width.
- **Tablet:** A 6-column grid for dashboard views.
- **Mobile:** A single-column vertical stack utilizing "Selling Cards" instead of tables.

Spacing is tight and systematic, following a 4px baseline. In data-heavy views, density is increased to allow administrators to see more records at once without scrolling. Padding in tables is strictly controlled to maintain vertical alignment across different data types.

## Elevation & Depth

To maintain a professional and functional atmosphere, this design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** The base canvas uses the tertiary color (#F8FAFC).
- **Level 1 (Cards/Tables):** White surfaces with a subtle 1px border (#E2E8F0).
- **Level 2 (Modals/Popovers):** Soft ambient shadows (15% opacity, 10px blur) are reserved only for temporary UI elements like filter menus or edit modals.

This "flat-plus" approach keeps the interface feeling lightweight and fast, crucial for high-volume data entry.

## Shapes

The design system employs **Soft (1)** roundedness. 
- Standard components like inputs and buttons use a `0.25rem` radius.
- Larger containers like data cards and dashboard panels use `0.5rem`.

This subtle rounding strikes a balance between the rigid precision of a spreadsheet and the friendly usability of a modern application. It softens the "industrial" feel of data management without sacrificing the professional aesthetic.

## Components

### Data Tables
Tables are the heart of the system. Headers should be sticky with a subtle bottom border. Row hover states use a light gray tint. Status cells (Verified/Unverified) should use background fills from the semantic palette defined in the Colors section.

### Mobile Selling Cards
For users selling tickets on the go, tables reflow into cards. Each card displays the "Boleta Número" prominently in the top right using `label-data` typography. Primary actions (Verify/Edit) are positioned at the bottom of the card for thumb-accessibility.

### Form Inputs
Inputs use a white background with a 1px `secondary_color_hex` border. Focus states use a 2px `primary_color_hex` ring. Error states utilize the `status_pink` for the border and a small supporting label.

### Status Toggles & Chips
- **Verified:** A green chip with a checkmark icon.
- **Unverified:** A ghost-style button that allows for quick "one-tap" verification.

### Role-Based Navigation
The sidebar navigation adjusts based on user permissions. "Administrators" see financial exports and user management; "Sellers" see a simplified view focused on ticket entry and their personal sales tally. Icons should be geometric and 20px in size.