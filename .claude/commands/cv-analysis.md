# CV Analysis Commands

## Core Analysis Commands

### CV Parsing & Analysis
```bash
# Test CV parsing functionality
npm run test -- src/backend/services/cv-parser.service.ts

# Test enhanced CV analysis
npm run test -- src/backend/services/enhanced-ats-analysis.service.ts

# Run role detection analysis
npm run test -- src/backend/services/role-detection-analyzer.ts
```

### ATS Optimization
```bash
# Test ATS optimization service
npm run test -- src/backend/services/ats-optimization.service.ts

# Run ATS scoring validation
npm run test -- src/backend/services/ats-optimization/ATSScoringService.ts

# Test keyword analysis
npm run test -- src/backend/services/ats-optimization/KeywordAnalysisService.ts
```

### Skills & Achievements Analysis
```bash
# Test skills proficiency analysis
npm run test -- src/backend/services/skills-proficiency.service.ts

# Test achievement highlighting
npm run test -- src/backend/functions/achievementHighlighting.ts

# Run personality insights validation
npm run test -- src/backend/services/personality-insights.service.ts
```

### CV Generation Commands
```bash
# Test CV generation service
npm run test -- src/backend/services/cv-generation.service.ts

# Test template generation
npm run test -- src/backend/services/cv-generator/templates/

# Validate feature integration
npm run test -- src/backend/services/cv-generator/features/
```

### Development & Debug
```bash
# Debug CV analysis pipeline
npm run debug:cv-analysis

# Watch for CV processing changes
npm run dev:cv-processing

# Generate sample analysis reports
npm run generate:sample-analysis
```