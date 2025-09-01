# Overview

This is a full-stack web application for AI-powered book writing and publishing. The platform allows users to upload documents, generate book content using AI, edit chapters, design covers, manage metadata, and export books in various formats. It provides a complete workflow from initial document processing to final publication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for dashboard, upload, generator, editor, covers, metadata, and export
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Dark theme with CSS variables for consistent theming across components

## Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration for hot module replacement in development
- **File Upload**: Multer for handling multipart file uploads with in-memory storage
- **Document Processing**: Custom document processor supporting PDF, DOCX, ODT, RTF, TXT, and Markdown files
- **Error Handling**: Centralized error handling middleware with structured error responses

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle migrations with schema definitions in TypeScript
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## Database Schema
- **Books**: Core entity with title, author, genre, description, keywords, content, cover URL, images, source file, target length, writing style, progress, and status
- **Chapters**: Individual chapter content with title, content, order, word count, and status linked to books
- **Covers**: Multiple cover designs per book with image URL, style, color scheme, and selection status
- **Users**: User management with username and password authentication

## Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-based session storage
- **User Authentication**: Username/password based authentication system
- **API Protection**: Middleware-based route protection for authenticated endpoints

## AI Integration
- **OpenAI Integration**: GPT-5 model for content generation including book outlines, chapter content, descriptions, keywords, and cover generation
- **Generation Features**: Book outline creation, chapter content generation, metadata optimization, and cover design assistance
- **Content Processing**: Text extraction and analysis from uploaded documents

## File Processing
- **Document Types**: Support for PDF, DOCX, ODT, RTF, TXT, MD, ODS, and ODP files
- **Text Extraction**: Custom processing pipeline for different document formats
- **Image Handling**: Extraction and processing of images from documents
- **Word Count Analysis**: Automatic word count calculation and content analysis

## Export and Publishing
- **Format Support**: Multiple export formats including Kindle (MOBI), EPUB, PDF, and Print-ready formats
- **Publishing Integration**: Preparation for various publishing platforms
- **Quality Control**: Content validation and formatting optimization

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **connect-pg-simple**: PostgreSQL session store for user authentication

## AI and Machine Learning
- **OpenAI API**: GPT-5 model access for content generation, using configurable API key from environment variables
- **Content Generation**: Book outlines, chapter writing, metadata optimization, and cover design suggestions

## UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives for building the component system
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **TypeScript**: Type safety across frontend and backend codebases
- **ESBuild**: Fast JavaScript bundler for production builds

## File Processing
- **Multer**: File upload handling middleware for Express.js
- **Document Processing Libraries**: Custom implementations for extracting text and metadata from various document formats

## Query and State Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form handling with validation and error management

## Replit Integration
- **Replit Vite Plugins**: Runtime error overlay and cartographer for development environment integration
- **Environment Detection**: Conditional plugin loading based on Replit environment variables