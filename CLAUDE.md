# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
pnpm dev
```
Starts the Vite development server with hot module replacement.

### Build Commands
```bash
pnpm build      # Full build with type checking
pnpm build-only # Build without type checking
pnpm preview    # Preview production build
```

### Type Checking and Formatting
```bash
pnpm type-check # Run TypeScript type checking
pnpm format     # Format code with Prettier
```

## Architecture Overview

This is a Vue 3 + TypeScript single-page application built with:

### Core Stack
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** as build tool
- **Pinia** for state management
- **Vue Router** for routing
- **Element Plus** UI component library
- **Tailwind CSS** for styling
- **Axios** for HTTP requests

### Project Structure

**Authentication & State Management:**
- `src/stores/auth.ts` - Authentication store with token/user management
- Routes with `requiresAuth: true` meta field require authentication
- Token stored in localStorage, automatic logout on token expiration

**API Layer:**
- `src/service/fetch.ts` - Axios instance with request/response interceptors
- `src/service/modules/common.ts` - API endpoint definitions
- API proxy configured to `https://www.osheeep.com` for `/api` routes

**Key Features:**
- **Notes Management** - CRUD operations for user notes with quadrant view positioning
- **Credentials Manager** - Secure password storage with reveal functionality
- **Study System** - Subject-based markdown file organization
- **Image Magic** - Image processing with color picker and pixelation worker
- **Todo Management** - Task organization system

**Component Architecture:**
- Components organized by feature in `src/components/`
- Views in `src/views/` follow feature-based structure
- Composables and utilities in respective directories

### Development Notes

**API Integration:**
- All API calls go through the centralized fetch instance
- Authentication token automatically attached to requests
- Automatic token expiration handling with redirect to login

**Routing:**
- Protected routes require authentication (`meta.requiresAuth: true`)
- Public routes accessible without login (`meta.public: true`)
- Automatic redirect handling for authenticated users

**Type Safety:**
- Comprehensive TypeScript types in `src/types/`
- API response types defined for all endpoints
- Vue component props and emits properly typed

**Image Processing:**
- Web Worker implementation for pixel processing (`src/workers/pixelate.worker.ts`)
- Canvas-based image manipulation in image magic features