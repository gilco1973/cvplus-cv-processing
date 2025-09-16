# @cvplus/processing

CVPlus Processing package - Core CV analysis, generation, and processing functionality with AI integration.

## Overview

This package provides comprehensive CV processing capabilities including:

- **AI-powered CV analysis** using Anthropic Claude
- **CV generation and enhancement** with customizable templates
- **PDF and document processing** with format conversion
- **Real-time processing workflows** with status tracking
- **ATS optimization** and compatibility scoring
- **Multi-language support** for international users

## Installation

```bash
npm install @cvplus/processing
```

## Usage

### Frontend Components

```typescript
import { CVUpload, CVEditor, ProcessingStatus } from '@cvplus/processing/frontend';

// Use CV processing components in your React app
<CVUpload onUpload={handleUpload} />
<CVEditor cvData={cvData} onChange={handleChange} />
<ProcessingStatus jobId={jobId} />
```

### Backend Functions

```typescript
import { generateCV, analyzeCV, processCV } from '@cvplus/processing/backend';

// Use Firebase Functions for CV processing
const result = await generateCV(request, response);
const analysis = await analyzeCV(cvContent);
const processed = await processCV(cvData, operations);
```

### Shared Types and Utilities

```typescript
import { 
  CVData, 
  ProcessingType, 
  validateCVData,
  sanitizeCVContent
} from '@cvplus/processing/shared';

// Use shared types and utilities
const isValid = validateCVData(cvData);
const sanitized = sanitizeCVContent(content);
```

## Architecture

### Package Structure

```
src/
├── backend/           # Firebase Functions and server-side services
│   ├── functions/     # CV processing Firebase Functions
│   └── services/      # Backend service implementations
├── frontend/          # React components and hooks
│   ├── components/    # CV processing UI components
│   └── hooks/         # Custom React hooks
├── shared/           # Code shared between frontend and backend
│   ├── types/        # Shared TypeScript interfaces
│   ├── utils/        # Shared utility functions
│   └── constants/    # Shared configuration constants
└── types/            # Package-specific type definitions
```

### Key Features

#### AI Integration
- **Claude API Integration**: Leverages Anthropic Claude for intelligent CV analysis
- **Smart Enhancement**: AI-powered content improvement and optimization
- **Language Processing**: Multi-language support with intelligent translation

#### Processing Pipeline
- **Modular Workflows**: Configurable processing steps and pipelines
- **Real-time Updates**: WebSocket-based status tracking
- **Error Recovery**: Automatic retry mechanisms and error handling

#### Template System
- **Dynamic Templates**: Customizable CV templates with theming
- **ATS Optimization**: Templates optimized for Applicant Tracking Systems
- **Export Formats**: PDF, HTML, DOCX, and JSON export capabilities

## Configuration

### Environment Variables

```bash
# AI Integration
ANTHROPIC_API_KEY=your_claude_api_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket

# Processing Settings
MAX_FILE_SIZE=10485760  # 10MB
PROCESSING_TIMEOUT=30000  # 30 seconds
```

### Processing Configuration

```typescript
import { PROCESSING_CONFIG } from '@cvplus/processing/shared';

// Default configuration
const config = {
  maxFileSize: PROCESSING_CONFIG.MAX_FILE_SIZE,
  supportedTypes: PROCESSING_CONFIG.SUPPORTED_FILE_TYPES,
  defaultModel: PROCESSING_CONFIG.DEFAULT_AI_MODEL
};
```

## API Reference

### Types

#### Core Types
- `CVData` - Main CV data structure
- `CVStatus` - Processing status enumeration
- `ProcessingType` - Type of processing operation

#### Request/Response Types
- `CVGenerationRequest/Response` - CV generation API types
- `CVAnalysisRequest/Response` - CV analysis API types
- `CVProcessingRequest/Response` - CV processing API types

#### Configuration Types
- `ProcessingOptions` - Processing configuration options
- `TemplateSettings` - CV template customization settings
- `AIServiceConfig` - AI service configuration

### Utilities

#### Validation
- `validateCVData(data)` - Validate CV data structure
- `isProcessingInProgress(status)` - Check if processing is active
- `isProcessingCompleted(status)` - Check if processing is done

#### Processing
- `sanitizeCVContent(content)` - Clean and normalize CV content
- `generateProcessingId()` - Generate unique processing identifiers
- `getProcessingTypeDisplayName(type)` - Get human-readable type names

## Development

### Building

```bash
npm run build          # Build all packages
npm run build:watch    # Build with file watching
npm run dev           # Development mode
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Type Checking

```bash
npm run type-check    # TypeScript type checking
npm run lint         # ESLint checking
npm run lint:fix     # Fix ESLint issues
```

## Migration Notes

This package is designed to receive migrated functionality from the root `functions/` directory. The current structure includes:

- **Placeholder functions** ready for code migration
- **Type-safe interfaces** for all processing operations  
- **Modular architecture** supporting incremental migration
- **Backward compatibility** with existing CVPlus systems

## Contributing

When contributing to this package:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new functionality
3. Update type definitions for new features
4. Maintain backward compatibility during migrations
5. Document new APIs and configuration options

## License

PROPRIETARY - This package is part of the CVPlus platform and is not open source.

---

**Author**: Gil Klainert  
**Repository**: https://github.com/cvplus/cvplus  
**Package**: @cvplus/cv-processing