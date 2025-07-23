# AImpact Platform - Project Structure Documentation

## 📁 Root Level Files

**File Name:** `.gitignore`  
**Description:** Git ignore file that specifies which files and directories should be excluded from version control (node_modules, build files, environment variables, etc.)

**File Name:** `package.json`  
**Description:** Node.js project configuration file containing dependencies, scripts, and metadata. Defines the React/TypeScript/Vite stack with AI and voice integration libraries.

**File Name:** `package-lock.json`  
**Description:** Auto-generated file that locks specific versions of dependencies to ensure consistent installs across environments.

**File Name:** `bun.lockb`  
**Description:** Bun package manager lockfile (binary format) for faster dependency resolution and installation.

**File Name:** `README.md`  
**Description:** Main project documentation with setup instructions and overview (Lovable platform integration).

**File Name:** `index.html`  
**Description:** Main HTML entry point for the React application, contains the root div where the app mounts.

**File Name:** `vite.config.ts`  
**Description:** Vite build tool configuration with React plugin, path aliases (@/ for src/), and development server settings.

**File Name:** `vite.config.js`  
**Description:** Alternative JavaScript version of Vite configuration (likely legacy/backup).

**File Name:** `tailwind.config.ts`  
**Description:** Tailwind CSS configuration with custom theme, colors, and component styling for the design system.

**File Name:** `postcss.config.js`  
**Description:** PostCSS configuration for processing CSS with Tailwind and other plugins.

**File Name:** `eslint.config.js`  
**Description:** ESLint configuration for code linting and style enforcement in TypeScript/React.

**File Name:** `tsconfig.json`  
**Description:** Main TypeScript configuration file with compiler options and project settings.

**File Name:** `tsconfig.app.json`  
**Description:** TypeScript configuration specifically for the application code (extends main config).

**File Name:** `tsconfig.node.json`  
**Description:** TypeScript configuration for Node.js-specific code (build tools, configs).

**File Name:** `components.json`  
**Description:** shadcn/ui components configuration file defining component paths and styling preferences.

## 📁 Legacy Python Files (Root Level)

**File Name:** `main.py`  
**Description:** Legacy Python entry point, likely from earlier prototype version of the platform.

**File Name:** `agent.py`  
**Description:** Legacy Python module for agent-related functionality (superseded by TypeScript implementation).

**File Name:** `agents.py`  
**Description:** Legacy Python module for multiple agent management (superseded by TypeScript implementation).

**File Name:** `dashboard.py`  
**Description:** Legacy Python dashboard implementation (superseded by React components).

**File Name:** `database.py`  
**Description:** Legacy Python database utilities (superseded by Supabase integration).

**File Name:** `knowledge_builder.py`  
**Description:** Legacy Python knowledge base builder (superseded by React/TypeScript version).

**File Name:** `knowledge_source.py`  
**Description:** Legacy Python knowledge source management (superseded by React/TypeScript version).

**File Name:** `workflow.py`  
**Description:** Legacy Python workflow engine (superseded by React/TypeScript DAG implementation).

**File Name:** `workflows.py`  
**Description:** Legacy Python workflows management (superseded by React/TypeScript version).

**File Name:** `studio_backend_example.py`  
**Description:** Legacy Python example for studio backend functionality (reference implementation).

## 📁 Legacy JSX Files (Root Level)

**File Name:** `AgentCreator.jsx`  
**Description:** Legacy JSX component for agent creation (superseded by TypeScript version in src/components/).

**File Name:** `AgentEditor.jsx`  
**Description:** Legacy JSX component for agent editing (superseded by TypeScript version in src/components/).

**File Name:** `App.jsx`  
**Description:** Legacy JSX main app component (superseded by App.tsx).

**File Name:** `KnowledgeSourceCreator.jsx`  
**Description:** Legacy JSX component for knowledge source creation (superseded by TypeScript version).

**File Name:** `KnowledgeSourceViewer.jsx`  
**Description:** Legacy JSX component for knowledge source viewing (superseded by TypeScript version).

**File Name:** `WorkflowCreator.jsx`  
**Description:** Legacy JSX component for workflow creation (superseded by TypeScript version).

**File Name:** `WorkflowEditor.jsx`  
**Description:** Legacy JSX component for workflow editing (superseded by TypeScript version).

## 📁 src/ Directory

**File Name:** `src/main.tsx`  
**Description:** React application entry point that mounts the App component to the DOM root element.

**File Name:** `src/App.tsx`  
**Description:** Main React application component with routing, providers (React Query, Tooltip), and global layout structure.

**File Name:** `src/App.css`  
**Description:** Global CSS styles for the application (supplementing Tailwind CSS).

**File Name:** `src/index.css`  
**Description:** Global CSS imports and base styles including Tailwind directives and custom CSS variables.

**File Name:** `src/vite-env.d.ts`  
**Description:** TypeScript declarations for Vite environment variables and module types.

## 📁 src/pages/ Directory

**File Name:** `src/pages/Index.tsx`  
**Description:** Landing page component with platform overview, agent creation tabs, and main navigation entry point.

**File Name:** `src/pages/Studio.tsx`  
**Description:** Agent Studio page with resizable panels for agent list, editor, and contextual help - main agent building interface.

**File Name:** `src/pages/AgentStore.tsx`  
**Description:** Agent marketplace page for browsing, installing, and managing pre-built agent templates with filtering and search.

**File Name:** `src/pages/AgentEngine.tsx`  
**Description:** Runtime management page showing active agent instances, system metrics, and engine configuration.

**File Name:** `src/pages/ObservabilityDashboard.tsx`  
**Description:** Monitoring dashboard with logs, metrics, alerts, and performance tracking for deployed agents.

**File Name:** `src/pages/VoiceAgents.tsx`  
**Description:** Voice-specific agent management page with creation, testing, and conversation interfaces.

**File Name:** `src/pages/KnowledgeBuilder.tsx`  
**Description:** Knowledge base management page for uploading, organizing, and managing agent knowledge sources.

**File Name:** `src/pages/AICopilot.tsx`  
**Description:** AI assistant interface page with command-based interaction and smart suggestions.

**File Name:** `src/pages/CorePlatform.tsx`  
**Description:** Legacy core platform page with workflow builder and technical documentation (being replaced by DeploymentCenter).

**File Name:** `src/pages/Auth.tsx`  
**Description:** Authentication page with login/signup forms and user session management.

**File Name:** `src/pages/Docs.tsx`  
**Description:** Documentation page with technical guides, API references, and platform usage instructions.

**File Name:** `src/pages/NotFound.tsx`  
**Description:** 404 error page component for handling invalid routes with error logging.

## 📁 src/components/ Directory Structure

### src/components/ui/
**Description:** Reusable UI components built with Radix UI and styled with Tailwind CSS (shadcn/ui system).

### src/components/agent-store/
**Description:** Components specific to the agent marketplace functionality including cards, filters, and installation dialogs.

### src/components/ai-copilot/
**Description:** Components for the AI assistant interface including chat, commands, and suggestion systems.

### src/components/analytics/
**Description:** Components for data visualization, metrics display, and performance analytics.

### src/components/auth/
**Description:** Authentication-related components including login forms, protected routes, and user management.

### src/components/core-platform/
**Description:** Core platform components for system status, feature cards, and technical documentation.

### src/components/knowledge/
**Description:** Knowledge management components for source upload, viewing, and organization.

### src/components/layout/
**Description:** Layout components including page wrappers, navigation, and responsive design elements.

### src/components/studio/
**Description:** Agent studio components including editors, builders, and development tools.

### src/components/voice-agents/
**Description:** Voice-specific components for agent creation, conversation handling, and audio interfaces.

### src/components/workflow/
**Description:** Workflow and DAG-related components for visual workflow building and execution.

### src/components/workspace/
**Description:** Workspace management components for user environments and project organization.

**File Name:** `src/components/Navbar.tsx`  
**Description:** Main navigation bar component with system-wide navigation links and user controls.

**File Name:** `src/components/AgentCard.tsx`  
**Description:** Reusable agent display card component showing agent info, status, and actions.

**File Name:** `src/components/AgentMarketplace.tsx`  
**Description:** Main marketplace component for browsing and managing agent templates.

**File Name:** `src/components/ApiKeyModal.tsx`  
**Description:** Modal component for managing API keys (ElevenLabs, OpenAI, etc.) with secure input.

**File Name:** `src/components/VoiceAgentCreator.tsx`  
**Description:** Form component for creating new voice agents with voice selection and configuration.

## 📁 src/hooks/ Directory

**File Name:** `src/hooks/use-agent-builder.ts`  
**Description:** Custom hook for agent creation and editing functionality with state management.

**File Name:** `src/hooks/use-agent-marketplace.tsx`  
**Description:** Custom hook for marketplace operations including browsing, filtering, and installing agents.

**File Name:** `src/hooks/use-agent-store.tsx`  
**Description:** Custom hook for agent store state management and operations.

**File Name:** `src/hooks/use-agent-store-demo.ts`  
**Description:** Demo version of agent store hook with mock data for development/testing.

**File Name:** `src/hooks/use-auth.tsx`  
**Description:** Authentication hook managing user sessions, login/logout, and auth state.

**File Name:** `src/hooks/use-enhanced-auth.tsx`  
**Description:** Enhanced authentication hook with additional features and organization management.

**File Name:** `src/hooks/use-enhanced-workspace.tsx`  
**Description:** Enhanced workspace management hook with advanced features.

**File Name:** `src/hooks/use-knowledge-builder.ts`  
**Description:** Custom hook for knowledge base creation and management operations.

**File Name:** `src/hooks/use-mobile.tsx`  
**Description:** Hook for detecting mobile devices and responsive behavior.

**File Name:** `src/hooks/use-model-comparison.tsx`  
**Description:** Hook for comparing different AI models and their performance metrics.

**File Name:** `src/hooks/use-model-performance.tsx`  
**Description:** Hook for tracking and analyzing AI model performance data.

**File Name:** `src/hooks/use-theme.tsx`  
**Description:** Theme management hook for dark/light mode switching.

**File Name:** `src/hooks/use-toast.ts`  
**Description:** Toast notification hook for displaying user feedback messages.

**File Name:** `src/hooks/use-user-workspace.tsx`  
**Description:** Hook for managing user workspace data and preferences.

**File Name:** `src/hooks/use-voice-agents.tsx`  
**Description:** Hook for voice agent operations including creation, testing, and management.

**File Name:** `src/hooks/use-workflow-execution.tsx`  
**Description:** Hook for executing and monitoring workflow processes.

**File Name:** `src/hooks/useAgentsApi.ts`  
**Description:** API hook for agent-related HTTP requests and data fetching.

**File Name:** `src/hooks/useElevenLabs.ts`  
**Description:** Hook for ElevenLabs voice API integration and voice management.

## 📁 src/services/ Directory

**File Name:** `src/services/api.ts`  
**Description:** Main API service with HTTP client configuration and common request utilities.

### src/services/ai/
**Description:** AI-related services for model integration, prompt management, and AI operations.

### src/services/auth/
**Description:** Authentication services for user management, session handling, and security.

### src/services/dag-engine/
**Description:** DAG (Directed Acyclic Graph) engine services for workflow processing and execution.

### src/services/workspace/
**Description:** Workspace management services for user environments and project data.

**File Name:** `src/services/voice-agents-enhanced.ts`  
**Description:** Enhanced voice agent services with advanced features and integrations.

**File Name:** `src/services/voice-agents-service.ts`  
**Description:** Core voice agent services for creation, management, and API interactions.

**File Name:** `src/services/workflow-service-enhanced.ts`  
**Description:** Enhanced workflow services with advanced execution and monitoring capabilities.

**File Name:** `src/services/workflow-service.ts`  
**Description:** Core workflow services for DAG processing and task execution.

## 📁 src/types/ Directory

**File Name:** `src/types/agent.types.ts`  
**Description:** TypeScript type definitions for agent-related data structures and interfaces.

**File Name:** `src/types/voice-agent.types.ts`  
**Description:** TypeScript type definitions specific to voice agent functionality and data models.

## 📁 src/utils/ Directory

**File Name:** `src/utils/voice-agent-operations.ts`  
**Description:** Utility functions for voice agent operations, transformations, and helper methods.

**File Name:** `src/utils/voice-agent-utils.ts`  
**Description:** Additional voice agent utility functions and common operations.

## 📁 src/lib/ Directory

**File Name:** `src/lib/utils.ts`  
**Description:** General utility functions including class name merging (cn) and common helper functions.

## 📁 src/integrations/ Directory

### src/integrations/supabase/
**Description:** Supabase integration files including client configuration, types, and database utilities.

## 📁 public/ Directory

**File Name:** `public/favicon.ico`  
**Description:** Website favicon icon displayed in browser tabs and bookmarks.

**File Name:** `public/placeholder.svg`  
**Description:** Placeholder SVG image used throughout the application for missing images.

**File Name:** `public/robots.txt`  
**Description:** Robots.txt file for search engine crawling instructions.

## 📁 backend/ Directory

**File Name:** `backend/main.py`  
**Description:** FastAPI application entry point with CORS, database initialization, and API routing.

**File Name:** `backend/start_server.py`  
**Description:** Server startup script for running the FastAPI backend with uvicorn.

**File Name:** `backend/test_backend.py`  
**Description:** Backend testing script for validating API functionality and database connections.

**File Name:** `backend/requirements.txt`  
**Description:** Python dependencies list for the FastAPI backend including AI libraries and database drivers.

**File Name:** `backend/.env.example`  
**Description:** Example environment variables file showing required configuration for API keys and database URLs.

**File Name:** `backend/README.md`  
**Description:** Backend-specific documentation with setup instructions and API documentation.

**File Name:** `backend/alembic.ini`  
**Description:** Alembic configuration file for database migrations and schema management.

### backend/alembic/
**Description:** Database migration files and Alembic configuration for schema versioning.

### backend/app/api/
**Description:** FastAPI route definitions and API endpoint implementations.

### backend/app/core/
**Description:** Core backend functionality including database, security, and configuration.

### backend/app/models/
**Description:** SQLAlchemy database models defining table structures and relationships.

### backend/app/schemas/
**Description:** Pydantic schemas for API request/response validation and serialization.

### backend/app/services/
**Description:** Business logic services for workflow execution, AI processing, and data operations.

## 📁 supabase/ Directory

**File Name:** `supabase/config.toml`  
**Description:** Supabase project configuration with database settings and service configurations.

### supabase/functions/
**Description:** Supabase Edge Functions for serverless AI processing, document handling, and API integrations.

#### supabase/functions/ai-chat/
**Description:** Edge function for AI chat processing and conversation management.

#### supabase/functions/copilot-chat/
**Description:** Edge function for AI copilot chat functionality and assistance.

#### supabase/functions/document-processor/
**Description:** Edge function for processing and analyzing uploaded documents.

#### supabase/functions/elevenlabs-tts/
**Description:** Edge function for ElevenLabs text-to-speech integration.

#### supabase/functions/semantic-search/
**Description:** Edge function for semantic search across knowledge bases.

#### supabase/functions/team-execution/
**Description:** Edge function for team-based workflow execution and coordination.

### supabase/migrations/
**Description:** SQL migration files for database schema creation and updates.

**File Name:** `supabase/migrations/20241201000001_create_voice_agents.sql`  
**Description:** Database migration creating voice agents table with RLS policies and sample data.

**File Name:** `supabase/migrations/20241201000002_enhance_workflows.sql`  
**Description:** Database migration enhancing workflow functionality and adding related tables.

**File Name:** `supabase/migrations/20241206000001_create_copilot_system.sql`  
**Description:** Database migration creating AI copilot system tables and functionality.

**File Name:** `supabase/migrations/20241206000002_create_copilot_rpc_functions.sql`  
**Description:** Database migration adding RPC functions for copilot operations.

**File Name:** `supabase/migrations/20241206000003_create_studio_system.sql`  
**Description:** Database migration creating studio system tables for agent development.

**File Name:** `supabase/migrations/20241206000004_create_agent_store.sql`  
**Description:** Database migration creating agent marketplace and store functionality.

**File Name:** `supabase/migrations/20241206000005_create_knowledge_system.sql`  
**Description:** Database migration creating knowledge base and source management system.

**File Name:** `supabase/migrations/20241206000006_create_analytics_system.sql`  
**Description:** Database migration creating analytics and metrics tracking system.

**File Name:** `supabase/migrations/20241206000007_create_agent_store_rpc_functions.sql`  
**Description:** Database migration adding RPC functions for agent store operations.

---

## 🏗️ Architecture Overview

This project follows a modern full-stack architecture:

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **AI Integration:** OpenAI, ElevenLabs, Azure OpenAI
- **Deployment:** Edge Functions + Serverless Architecture

## 🚀 Key Features

1. **Agent Studio** - Visual agent builder with no-code interface
2. **Agent Store** - Marketplace for sharing and discovering agents
3. **Voice Integration** - Human-like voice capabilities via ElevenLabs
4. **Workflow Engine** - DAG-based automation and processing
5. **Knowledge Management** - Document processing and semantic search
6. **Observability** - Comprehensive monitoring and analytics
7. **Multi-tenancy** - Organization-based isolation and access control

## 📝 Development Status

- ✅ **Frontend Architecture** - Complete with modern React setup
- ✅ **Database Schema** - Comprehensive with proper migrations
- ✅ **Authentication** - Multi-provider auth with RLS
- 🔄 **Backend Services** - Partially implemented, needs enhancement
- 🔄 **AI Integration** - Basic implementation, needs optimization
- ❌ **Production Deployment** - Not yet configured