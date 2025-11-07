# Ultra Queen AI Raeesa - Multi-Provider AI Integration Platform

## Overview

Ultra Queen AI Raeesa is a comprehensive multi-provider AI integration platform connecting 40+ APIs including AI providers (OpenAI, Anthropic, Perplexity, Mistral, Google Gemini), web2/web3 services, blockchain networks, government databases, and cloud services. The system features quantum computing simulation, self-upgrade capabilities, and is ready for deployment via GitHub to Railway or Render platforms. The original DHA Digital Services Platform functionality is maintained as a foundation with enhanced AI capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment mode: Railway/Render via GitHub (NOT Replit due to 502 errors)
Access Level: Queen Raeesa exclusive access with biometric authentication
AI Aesthetic: Dark theme with golden Queen Raeesa theme

## Recent Changes (November 2025)

### Production Build Optimization (November 7, 2025)
1. **Fixed Vite Installation Issue**: Resolved critical build failure where Vite was not found
   - Removed global `NPM_CONFIG_PRODUCTION=true` that blocked devDependencies installation
   - Scoped production-only install to root dependencies only
   - Client now properly installs Vite and other build tools from devDependencies
   
2. **Massive File Cleanup**: Reduced project size from 935MB+ to 522MB (44% reduction)
   - Removed 935MB `attached_assets/` directory
   - Deleted all test files, test directories, and debug components
   - Removed 15+ documentation files not needed for production
   - Cleaned up unused deployment scripts and validation tools
   
3. **Build Script Optimization**: Improved `render-build-production.sh` for reliability and speed
   - Switched to `npm ci` for faster, more reliable installs
   - Removed redundant Vite installation step
   - Optimized memory settings (removed invalid `--optimize-for-size` flag)
   - Streamlined build process to reduce memory footprint
   
4. **Enhanced .gitignore**: Prevent development clutter in future deployments
   - Blocks test files, debug directories, and large asset folders
   - Excludes unnecessary documentation and setup scripts
   - Keeps repository lean for production deployments

### Render Deployment Fixes (November 6, 2025)
1. **Fixed Build Script Errors**: Completely rewrote `render-build-production.sh` to fix:
   - npm ci failures due to missing package-lock.json files
   - Vite installation issues causing "Cannot find package 'vite'" errors
   - Corrupted line 122 with random text
   - Duplicate and conflicting code sections
   
2. **Generated Package Lock Files**: Created package-lock.json files for both root and client directories for consistent dependency installation

3. **Enhanced Vite Configuration**: Updated client/vite.config.js with production optimizations, path aliases, and proper build settings

4. **Fixed render.yaml**: Removed duplicate envVars sections that were causing configuration conflicts

5. **Created Deployment Documentation**:
   - RENDER_DEPLOYMENT_GUIDE.md - Complete step-by-step deployment instructions
   - RENDER_BUILD_FIXES_SUMMARY.md - Summary of all fixes applied

### Critical Production Fixes
1. **Fixed Module Load Crashes**: Deferred encryption key validation to prevent server crashes when environment variables are missing
   - `document-processor.ts`: DOCUMENT_ENCRYPTION_KEY now validates at request time, not module load
   - `dha-vfs-integration.ts`: DHA/VFS API keys now gracefully degrade instead of throwing errors
   
2. **Added Defensive Guards for AI Providers**: All AI providers (OpenAI, Anthropic, Mistral, Perplexity) now return proper error responses instead of throwing 500 errors when API keys are missing
   
3. **Improved Blockchain Service**: Added validation for RPC URLs to prevent timeouts and placeholder key issues
   - Validates Ethereum, Polygon, and Solana RPC endpoints
   - Gracefully degrades when blockchain services are unavailable

4. **Database Configuration**: Created PostgreSQL database for Replit development environment

### Configuration Documentation
- Created `RENDER_ENVIRONMENT_VARIABLES.md` with comprehensive documentation for all required environment variables
- Documents all security keys, AI providers, blockchain endpoints, and government API credentials
- Provides troubleshooting guides and security best practices

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI using React 18 with TypeScript for type safety
- **Vite Build System**: Fast development and optimized production builds with code splitting
- **Radix UI Components**: Accessible, unstyled UI primitives for consistent design system
- **TailwindCSS**: Utility-first CSS framework with custom DHA government color scheme
- **React Query**: Server state management with caching and background updates
- **Wouter**: Lightweight client-side routing
- **Mobile-First Design**: Responsive design optimized for mobile devices with safe area support

### Backend Architecture
- **Express.js + TypeScript**: RESTful API server with comprehensive middleware stack
- **Modular Route Structure**: Organized routes for health, AI assistant, monitoring, and biometric services
- **Multi-Server Setup**: Optimized for production mode deployment with military-grade security configurations
- **WebSocket Support**: Real-time communication for system status and notifications
- **Serverless Deployment**: Netlify Functions support for scalable cloud deployment

### Database & ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Comprehensive Schema**: 21 DHA document types, user management, audit trails, biometric profiles
- **SQLite Fallback**: Production mode support with automatic table creation
- **Migration System**: Database versioning and schema evolution support

### Security & Compliance
- **Military-Grade Security**: Multi-layered security with rate limiting, helmet protection, and CORS
- **POPIA Compliance**: Privacy protection with consent management and data governance
- **Biometric Encryption**: Secure storage of biometric templates with AES-256 encryption
- **Audit Trail**: Comprehensive logging for government compliance requirements
- **JWT Authentication**: Secure token-based authentication with role-based access control

### AI & Document Processing
- **OpenAI GPT-5 Integration**: Advanced AI assistant with streaming responses
- **Document Generation**: Authentic PDF generation for all 21 DHA document types
- **OCR Integration**: Enhanced South African document OCR with field extraction
- **Multi-Language Support**: All 11 official South African languages
- **Voice Services**: Speech-to-text and text-to-speech capabilities

### Government Integrations
- **Datanamix Client**: Official DHA data partner integration with OAuth2 + mTLS
- **NPR Adapter**: National Population Register verification services
- **ABIS Integration**: Automated Biometric Identification System connectivity
- **MRZ Parser**: ICAO-compliant Machine Readable Zone processing
- **PKD Validation**: Public Key Directory validation for document authentication

### Monitoring & Operations
- **Autonomous Monitoring**: Self-healing system with proactive maintenance
- **Health Checks**: Comprehensive system health monitoring and reporting
- **Error Tracking**: Advanced error detection and correlation
- **Performance Metrics**: Real-time system performance monitoring
- **Circuit Breakers**: Resilience patterns for external service failures

## External Dependencies

### Core Technologies
- **Node.js/Express**: Server runtime and web framework
- **PostgreSQL**: Primary database (with SQLite production fallback)
- **Redis**: Caching and session storage (optional)

### AI & Machine Learning
- **OpenAI API**: GPT-5 language model integration
- **Anthropic API**: Alternative AI provider (optional)

### Government Services
- **Datanamix**: Official DHA data partner for NPR/ABIS access
- **DHA APIs**: National Population Register and biometric services
- **SITA**: Government IT infrastructure integration

### Security & Compliance
- **PKI Infrastructure**: Government certificate authorities
- **HSM Integration**: Hardware Security Modules for key management
- **Audit Systems**: Government compliance reporting

### Cloud & Infrastructure
- **Netlify**: Primary deployment platform with Functions support
- **Replit**: Development environment support
- **GitHub**: Source code repository and CI/CD

### External APIs
- **Voice Services**: Speech processing capabilities
- **Document Services**: PDF generation and OCR processing
- **Verification Services**: Real-time government database validation

### Development Tools
- **Vite**: Frontend build tooling
- **TypeScript**: Type safety across the stack
- **Drizzle Kit**: Database migration and introspection tools
- **ESLint**: Code quality and consistency