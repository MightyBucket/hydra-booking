# LessonBook - Lesson Booking & Management Application

## Overview

LessonBook is a professional lesson booking and management system designed for educators and tutors. The application provides a comprehensive platform for managing students, scheduling lessons, tracking payments, and organizing educational activities through an intuitive calendar interface. Built with modern web technologies, it emphasizes efficiency, clarity, and ease of use for educational professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints with proper error handling and validation
- **Session Management**: Express sessions with PostgreSQL session store
- **Development Mode**: Vite integration for hot module replacement and development tooling

### Database Design
- **Students Table**: Core entity storing student information including contact details, default subjects, and rates
- **Lessons Table**: Individual lesson records with scheduling, pricing, and payment status tracking
- **Recurring Lessons Table**: Template system for managing repeating lesson schedules
- **Relationships**: Foreign key constraints ensuring data integrity between students and their lessons

### Design System
- **Style Guide**: Material Design influenced approach prioritizing efficiency and learnability
- **Color Scheme**: Professional blue primary color with comprehensive light/dark mode support
- **Typography**: Inter font family for optimal readability across all interface elements
- **Layout**: Consistent 8px grid system with generous whitespace for calendar readability
- **Responsive Design**: Mobile-first approach with adaptive navigation and touch-friendly interfaces

### Data Flow Architecture
- **Client-Server Communication**: JSON-based REST API with automatic request/response validation
- **Caching Strategy**: Optimistic updates with query invalidation for real-time data consistency
- **Error Handling**: Centralized error boundaries with user-friendly error messages and toast notifications
- **Form State**: Controlled components with real-time validation and submission feedback

## External Dependencies

### Database Infrastructure
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalable cloud deployment
- **Connection Management**: Connection pooling through @neondatabase/serverless for optimal performance
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization

### UI Component Libraries
- **Component System**: Radix UI primitives providing accessible, unstyled components
- **Styling Framework**: Tailwind CSS for utility-first responsive design
- **Icons**: Lucide React for consistent iconography throughout the application
- **Animation**: CSS-based transitions with Tailwind utilities for smooth user interactions

### Development Tools
- **Type Safety**: TypeScript configuration with strict mode for comprehensive type checking
- **Code Quality**: ESLint integration for consistent code standards
- **Build Optimization**: Vite with tree-shaking and code splitting for optimal bundle sizes
- **Development Experience**: Hot module replacement and error overlay for rapid development cycles

### Date and Time Management
- **Date Manipulation**: date-fns library for comprehensive date operations and formatting
- **Calendar Components**: Custom calendar implementation built on date-fns for lesson scheduling
- **Timezone Handling**: Browser-based timezone detection with UTC storage for consistency

### Authentication and Security
- **Session Management**: Express session middleware with secure cookie configuration
- **Input Validation**: Zod schemas for runtime type checking and data validation
- **Security Headers**: Standard Express security middleware for protection against common vulnerabilities