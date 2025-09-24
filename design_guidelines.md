# Lesson Booking App Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design influenced)
**Justification**: This is a utility-focused productivity application where efficiency and learnability are paramount. Users need to quickly schedule, view, and manage lessons with minimal friction.

**Key Design Principles**:
- Clarity and efficiency over visual flair
- Consistent patterns for recurring actions
- Information hierarchy that prioritizes upcoming lessons
- Professional appearance suitable for educational/business context

## Core Design Elements

### A. Color Palette
**Light Mode**:
- Primary: 216 100% 50% (Professional blue)
- Surface: 0 0% 98% (Near white backgrounds)
- Text: 220 13% 18% (Dark gray)

**Dark Mode**:
- Primary: 216 100% 60% (Lighter blue for contrast)
- Surface: 220 13% 8% (Dark background)
- Text: 220 13% 87% (Light gray)

**Accent Colors** (use sparingly):
- Success: 142 71% 45% (For confirmed lessons)
- Warning: 45 93% 58% (For pending payments)
- Error: 0 84% 60% (For cancelled lessons)

### B. Typography
**Font Family**: Inter (Google Fonts)
- Headers: 600 weight, clean and readable
- Body text: 400 weight for readability
- Small text/labels: 500 weight for emphasis

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, and 8 (p-2, m-4, h-8, etc.)
- Consistent 8px grid system
- Generous whitespace for calendar readability
- Compact spacing for data-dense lesson lists

### D. Component Library

**Core UI Elements**:
- Clean, minimal buttons with subtle shadows
- Form inputs with clear labels and validation states
- Cards with soft shadows for lesson information
- Status badges for payment/booking states

**Calendar Components**:
- Month/week/day view toggle
- Time slot grid with 15-minute increments
- Lesson blocks with student name, subject, and duration
- Color coding by lesson status or subject type

**Navigation**:
- Side navigation with calendar, students, and settings
- Breadcrumb navigation for deeper screens
- Quick action buttons for common tasks (Add Lesson, New Student)

**Data Displays**:
- Student profile cards with contact information
- Lesson detail panels with all relevant information
- Payment status indicators
- Recurring lesson pattern displays

**Forms & Modals**:
- Lesson booking form with date/time picker
- Student registration form
- Recurring lesson setup wizard
- Confirmation dialogs for cancellations

### E. Animations
**Minimal Approach**: Only essential transitions
- Smooth calendar navigation between months/weeks
- Subtle hover states on clickable elements
- Loading states for database operations

## Layout Strategy
- **Primary View**: Full-screen calendar as the main interface
- **Secondary Panels**: Sliding panels for lesson details and forms
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Information Density**: Balance between overview and detail - users should see upcoming lessons at a glance while having access to comprehensive information when needed

## Key Interaction Patterns
- Click lesson blocks to view/edit details
- Drag and drop for lesson rescheduling
- Quick add via calendar time slot clicks
- Student search and selection dropdowns
- One-click recurring lesson setup

This design system prioritizes functionality and user efficiency while maintaining a clean, professional appearance appropriate for an educational business tool.