# CVPlus Integration Commands

## Integration Testing

### Parent Project Integration
```bash
# Test integration with main CVPlus project
npm run test:integration

# Validate parent service communication
npm run test -- src/frontend/integration/ParentIntegrationService.ts

# Test autonomous service container
npm run test -- src/frontend/services/ServiceContainer.ts
```

### Firebase Functions Integration
```bash
# Test Firebase Functions exports
npm run test -- src/backend/functions/

# Validate function deployment structure
npm run build && npm run validate:functions

# Test function middleware integration
npm run test -- src/backend/middleware/
```

### Cross-Module Integration
```bash
# Test auth module integration
npm run test:auth-integration

# Test core module integration  
npm run test:core-integration

# Validate type compatibility
npm run type-check:integration
```

### API Integration
```bash
# Test Claude API integration
npm run test:claude-integration

# Test Firebase integration
npm run test:firebase-integration

# Validate external API connections
npm run test:external-apis
```

### Frontend Integration
```bash
# Test React component integration
npm run test -- src/frontend/components/

# Test hook integrations
npm run test -- src/frontend/hooks/

# Validate frontend service integration
npm run test -- src/frontend/services/
```

### Build Integration
```bash
# Test build output compatibility
npm run build:test

# Validate export structure
npm run validate:exports

# Test package resolution
npm run test:package-resolution
```