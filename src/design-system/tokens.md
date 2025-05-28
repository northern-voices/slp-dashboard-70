
# Design System Tokens

## Overview
This document outlines the design tokens that form the foundation of our design system. These tokens ensure consistency across all UI components and provide a single source of truth for design decisions.

## Color Palette

### Brand Colors
- **Primary**: `hsl(221.2, 83.2%, 53.3%)` - Blue 600 (#2563eb)
- **Primary Dark**: `hsl(224.3, 76.3%, 48%)` - Blue 700 (#1d4ed8)
- **Primary Light**: `hsl(213.3, 93.9%, 67.8%)` - Blue 400 (#60a5fa)
- **Primary Foreground**: `hsl(210, 40%, 98%)` - White (#fafafa)

### Status Colors
- **Success**: `hsl(142.1, 76.2%, 36.3%)` - Green 600 (#059669)
- **Warning**: `hsl(45.4, 93.4%, 47.5%)` - Amber 500 (#f59e0b)
- **Error/Destructive**: `hsl(0, 84.2%, 60.2%)` - Red 500 (#ef4444)
- **Info**: `hsl(217.2, 91.2%, 59.8%)` - Blue 500 (#3b82f6)

### Neutral Colors
- **Background**: `hsl(0, 0%, 100%)` - White (#ffffff)
- **Foreground**: `hsl(222.2, 84%, 4.9%)` - Gray 900 (#0f172a)
- **Muted**: `hsl(210, 40%, 96.1%)` - Gray 50 (#f8fafc)
- **Border**: `hsl(214.3, 31.8%, 91.4%)` - Gray 200 (#e5e7eb)

## Typography

### Font Sizes
- **XS**: 0.75rem (12px)
- **SM**: 0.875rem (14px)
- **Base**: 1rem (16px)
- **LG**: 1.125rem (18px)
- **XL**: 1.25rem (20px)
- **2XL**: 1.5rem (24px)
- **3XL**: 1.875rem (30px)
- **4XL**: 2.25rem (36px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Heading Scale
- **H1**: 2.25rem (36px) / font-semibold
- **H2**: 1.875rem (30px) / font-semibold
- **H3**: 1.5rem (24px) / font-semibold
- **H4**: 1.25rem (20px) / font-semibold
- **H5**: 1.125rem (18px) / font-semibold
- **H6**: 1rem (16px) / font-semibold

## Spacing Scale

### Base Scale
- **XS**: 0.25rem (4px)
- **SM**: 0.5rem (8px)
- **MD**: 1rem (16px)
- **LG**: 1.5rem (24px)
- **XL**: 2rem (32px)
- **2XL**: 3rem (48px)

### Component Spacing
- **Button Padding**: 0.5rem 1rem (8px 16px)
- **Card Padding**: 1.5rem (24px)
- **Input Padding**: 0.5rem 0.75rem (8px 12px)
- **Section Margin**: 2rem (32px)

## Border Radius

### Scale
- **SM**: 0.25rem (4px)
- **MD**: 0.5rem (8px)
- **LG**: 0.75rem (12px)
- **XL**: 1rem (16px)

### Component Usage
- **Buttons**: 0.5rem (8px)
- **Cards**: 0.75rem (12px)
- **Inputs**: 0.5rem (8px)
- **Modals**: 1rem (16px)

## Shadows

### Scale
- **SM**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **MD**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **LG**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

### Component Usage
- **Cards**: var(--shadow-sm)
- **Dropdowns**: var(--shadow-md)
- **Modals**: var(--shadow-lg)
- **Elevated Cards**: var(--shadow-lg)

## CSS Custom Properties Usage

### In Components
```css
.component {
  background-color: hsl(var(--brand-primary));
  color: hsl(var(--brand-primary-foreground));
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}
```

### In Tailwind Classes
```html
<div class="bg-brand text-brand-foreground rounded-md p-md shadow-sm">
  Component content
</div>
```

## Accessibility Guidelines

### Focus States
- All interactive elements must have visible focus indicators
- Focus rings should use `--ring` color with 2px width
- Focus offset should be 2px for most components

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio against background

### Touch Targets
- Minimum 44px x 44px for mobile interactions
- 8px minimum spacing between interactive elements

## Brand Personality

### Visual Style
- **Modern**: Clean lines, generous whitespace
- **Professional**: Consistent typography, structured layouts
- **Approachable**: Soft rounded corners, friendly interactions
- **Trustworthy**: High contrast, clear hierarchy

### Animation Principles
- **Subtle**: 200-300ms transitions
- **Purposeful**: Animations guide user attention
- **Accessible**: Respects prefers-reduced-motion
- **Consistent**: Same easing and duration patterns

## Implementation Notes

### CSS Variables
All design tokens are implemented as CSS custom properties for:
- Runtime theme switching capability
- Easy maintenance and updates
- Better browser support than Tailwind config alone

### Tailwind Integration
Tokens are mapped to Tailwind utilities for:
- Developer convenience
- Consistent naming conventions
- Build-time optimization

### Component Guidelines
- Use semantic color names (brand, success, warning) over specific color values
- Prefer design tokens over hardcoded values
- Maintain consistent spacing using the defined scale
- Follow the established typography hierarchy
