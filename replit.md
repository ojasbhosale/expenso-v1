# Expenso - Expense Tracking Application

## Overview

Expenso is a modern expense tracking web application built with a full-stack TypeScript architecture. The application allows users to register, login, and manage their personal expenses through categories and detailed expense tracking. It features a clean, responsive interface built with React and shadcn/ui components, backed by an Express.js server with PostgreSQL database using Drizzle ORM.

## System Architecture

The application follows a monorepo structure with three main directories:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and database schema

**Technology Stack:**
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Authentication**: Express sessions with bcrypt password hashing
- **Deployment**: Replit with autoscale deployment target

## Key Components

### Frontend Architecture
- **Routing**: wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Session-based auth with express-session and MemoryStore
- **Password Security**: bcryptjs for password hashing
- **Data Storage**: Abstracted storage interface with both database and in-memory implementations

### Database Schema
The application uses three main entities:
- **Users**: User accounts with email, password, and profile information
- **Categories**: Expense categories with customizable icons and colors
- **Expenses**: Individual expense records linked to users and categories

## Data Flow

1. **Authentication Flow**: Users register/login through forms that validate against Zod schemas, passwords are hashed with bcrypt, and sessions are managed server-side
2. **Expense Management**: CRUD operations for expenses with real-time updates through TanStack Query invalidation
3. **Category Management**: Users can create custom categories with icons and colors to organize expenses
4. **Dashboard Analytics**: Real-time statistics calculation including total expenses, weekly totals, and category breakdowns

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript support
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation
- **Styling**: TailwindCSS with class-variance-authority for component variants

### Backend Dependencies
- **Web Framework**: Express.js with TypeScript
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM
- **Authentication**: express-session with connect-pg-simple for session store
- **Security**: bcryptjs for password hashing
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build Tool**: Vite for frontend development and building
- **TypeScript**: Strict TypeScript configuration across the entire stack
- **Code Quality**: Configured with proper TypeScript paths and module resolution

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` starts the Express server with Vite middleware
- **Production Build**: `npm run build` creates optimized frontend bundle and compiles server
- **Production Server**: `npm run start` runs the compiled server
- **Database**: Uses Neon Database for PostgreSQL hosting
- **Session Storage**: In-memory store for development, can be upgraded to PostgreSQL session store for production

The deployment uses Replit's autoscale target with proper build and run commands configured in `.replit` file. The application serves the built frontend from the Express server in production mode.

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```