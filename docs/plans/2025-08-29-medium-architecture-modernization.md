# MEDIUM Priority Implementation Plan: Architecture Modernization

**Author**: Gil Klainert  
**Date**: 2025-08-29  
**Priority**: MEDIUM  
**Timeline**: Week 2-3 (10-14 days)  
**Status**: STRUCTURAL IMPROVEMENT  
**Diagram**: [Architecture Modernization Strategy](../diagrams/2025-08-29-architecture-modernization.mermaid)

## Executive Summary

This plan addresses the architectural debt accumulated in the cv-processing package by implementing modern software architecture patterns. The current tightly-coupled, monolithic structure will be transformed into a modular, maintainable, and scalable architecture using dependency injection, service abstraction, and clean architecture principles.

## Current Architecture Analysis

### Architectural Issues Identified

#### 1. Tight Coupling & Monolithic Structure
- **Issue**: Direct dependencies between components
- **Impact**: Difficult testing, poor maintainability, rigid structure
- **Examples**:
  ```typescript
  // CURRENT: Tight coupling
  class CVGenerationService {
    constructor() {
      this.aiClient = new AnthropicClient() // Hard dependency
      this.storage = new FirebaseStorage()   // Hard dependency
    }
  }
  ```

#### 2. Missing Service Layer Abstraction
- **Issue**: Business logic scattered across functions and components
- **Impact**: Code duplication, inconsistent behavior, poor testability
- **Examples**:
  - CV processing logic duplicated in 5+ functions
  - Analysis algorithms embedded in UI components
  - No clear separation of concerns

#### 3. Lack of Dependency Injection
- **Issue**: Hard-coded dependencies throughout codebase
- **Impact**: Impossible to unit test, inflexible configuration, tight coupling
- **Examples**:
  - API clients instantiated directly in services
  - Database connections hard-coded in functions
  - No mock capability for testing

#### 4. Inconsistent Error Handling
- **Issue**: Different error handling patterns across modules
- **Impact**: Unpredictable behavior, poor user experience, difficult debugging
- **Examples**:
  - Some functions throw exceptions, others return error objects
  - No centralized error logging or monitoring
  - Inconsistent error message formats

#### 5. Poor Separation of Concerns
- **Issue**: Mixed presentation, business logic, and data access
- **Impact**: Difficult maintenance, testing challenges, unclear responsibilities
- **Examples**:
  - React components containing business logic
  - Database queries in UI components
  - Validation logic scattered across layers

## Target Architecture Vision

### Modern Architecture Principles

#### 1. Clean Architecture Implementation
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ React Components│  │   API Routes    │  │  Firebase    │ │
│  │                 │  │                 │  │  Functions   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Use Cases     │  │   Commands      │  │   Queries    │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Entities     │  │ Domain Services │  │ Repositories │ │
│  │                 │  │                 │  │ (Interfaces) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Firebase      │  │   Anthropic     │  │   External   │ │
│  │   Repository    │  │   AI Client     │  │   APIs       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Service-Oriented Architecture
```typescript
// TARGET: Service abstraction with dependency injection
interface ICVGenerationService {
  generateCV(data: CVData): Promise<GeneratedCV>
  validateInput(data: CVData): ValidationResult
}

interface IAIClient {
  analyze(content: string): Promise<AnalysisResult>
  generate(prompt: string): Promise<string>
}

class CVGenerationService implements ICVGenerationService {
  constructor(
    private aiClient: IAIClient,
    private storage: IStorageService,
    private validator: IValidationService
  ) {}
  
  async generateCV(data: CVData): Promise<GeneratedCV> {
    // Implementation using injected dependencies
  }
}
```

## Implementation Plan

### Phase 1: Foundation Layer (Week 2 - Days 8-10)

#### Task 1.1: Dependency Injection Container (Day 8 - 8 hours)

**Create IoC Container System**:
```typescript
// src/shared/container/container.ts
interface Container {
  register<T>(token: symbol, factory: () => T): void
  registerSingleton<T>(token: symbol, factory: () => T): void
  resolve<T>(token: symbol): T
  createScope(): Container
}

class DIContainer implements Container {
  private services = new Map<symbol, ServiceRegistration>()
  private singletons = new Map<symbol, any>()
  
  register<T>(token: symbol, factory: () => T): void {
    this.services.set(token, { factory, singleton: false })
  }
  
  registerSingleton<T>(token: symbol, factory: () => T): void {
    this.services.set(token, { factory, singleton: true })
  }
  
  resolve<T>(token: symbol): T {
    const registration = this.services.get(token)
    if (!registration) {
      throw new Error(`Service not registered: ${token.toString()}`)
    }
    
    if (registration.singleton) {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, registration.factory())
      }
      return this.singletons.get(token)
    }
    
    return registration.factory()
  }
}
```

**Service Registration**:
```typescript
// src/shared/container/tokens.ts
export const TOKENS = {
  // AI Services
  AI_CLIENT: Symbol('AIClient'),
  CV_ANALYSIS_SERVICE: Symbol('CVAnalysisService'),
  PREDICTION_SERVICE: Symbol('PredictionService'),
  
  // Storage Services
  STORAGE_SERVICE: Symbol('StorageService'),
  CACHE_SERVICE: Symbol('CacheService'),
  
  // Validation Services
  VALIDATION_SERVICE: Symbol('ValidationService'),
  SECURITY_SERVICE: Symbol('SecurityService'),
  
  // External Services
  EXTERNAL_DATA_SERVICE: Symbol('ExternalDataService'),
  NOTIFICATION_SERVICE: Symbol('NotificationService')
}

// src/shared/container/registration.ts
export function registerServices(container: Container) {
  // AI Services
  container.registerSingleton(TOKENS.AI_CLIENT, () => new AnthropicClient({
    apiKey: getSecureApiKey()
  }))
  
  container.register(TOKENS.CV_ANALYSIS_SERVICE, () => 
    new CVAnalysisService(
      container.resolve(TOKENS.AI_CLIENT),
      container.resolve(TOKENS.VALIDATION_SERVICE)
    )
  )
  
  // Storage Services
  container.registerSingleton(TOKENS.STORAGE_SERVICE, () => 
    new FirebaseStorageService()
  )
  
  // Validation Services
  container.register(TOKENS.VALIDATION_SERVICE, () => 
    new ComprehensiveValidationService()
  )
}
```

**Acceptance Criteria**:
- [ ] IoC container implemented with full functionality
- [ ] Service registration system operational
- [ ] Scope management for request-level services
- [ ] Error handling for missing dependencies

#### Task 1.2: Domain Model Definition (Day 8 - 4 hours)

**Core Domain Entities**:
```typescript
// src/shared/domain/entities/CV.ts
export class CV {
  constructor(
    public readonly id: CVId,
    public readonly content: CVContent,
    public readonly metadata: CVMetadata,
    private status: CVStatus = CVStatus.DRAFT
  ) {}
  
  analyze(analysisService: ICVAnalysisService): Promise<AnalysisResult> {
    return analysisService.analyze(this.content)
  }
  
  validate(): ValidationResult {
    return CVValidator.validate(this.content)
  }
  
  markAsProcessed(): void {
    this.status = CVStatus.PROCESSED
  }
  
  isProcessed(): boolean {
    return this.status === CVStatus.PROCESSED
  }
}

// src/shared/domain/value-objects/CVContent.ts
export class CVContent {
  constructor(
    private readonly sections: CVSection[],
    private readonly format: CVFormat
  ) {
    this.validate()
  }
  
  private validate(): void {
    if (this.sections.length === 0) {
      throw new Error('CV must have at least one section')
    }
  }
  
  getSections(): readonly CVSection[] {
    return this.sections
  }
  
  getFormat(): CVFormat {
    return this.format
  }
}
```

**Repository Interfaces**:
```typescript
// src/shared/domain/repositories/ICVRepository.ts
export interface ICVRepository {
  save(cv: CV): Promise<void>
  findById(id: CVId): Promise<CV | null>
  findByUserId(userId: UserId): Promise<CV[]>
  delete(id: CVId): Promise<void>
}

// src/shared/domain/repositories/IAnalysisRepository.ts
export interface IAnalysisRepository {
  save(analysis: AnalysisResult): Promise<void>
  findByCVId(cvId: CVId): Promise<AnalysisResult | null>
  findByUserId(userId: UserId): Promise<AnalysisResult[]>
}
```

**Acceptance Criteria**:
- [ ] Core domain entities defined with business logic
- [ ] Value objects implemented with validation
- [ ] Repository interfaces defined for all aggregates
- [ ] Domain services identified and specified

#### Task 1.3: Service Abstraction Layer (Day 9 - 8 hours)

**Base Service Infrastructure**:
```typescript
// src/shared/services/BaseService.ts
export abstract class BaseService {
  protected logger: ILogger
  protected validator: IValidator
  
  constructor(
    logger: ILogger,
    validator: IValidator
  ) {
    this.logger = logger
    this.validator = validator
  }
  
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<Result<T>> {
    try {
      this.logger.info(`Starting operation: ${context}`)
      const result = await operation()
      this.logger.info(`Completed operation: ${context}`)
      return Result.success(result)
    } catch (error) {
      this.logger.error(`Failed operation: ${context}`, error)
      return Result.failure(error as Error)
    }
  }
  
  protected validateInput<T>(input: T, schema: ValidationSchema): ValidationResult {
    return this.validator.validate(input, schema)
  }
}
```

**CV Processing Service**:
```typescript
// src/backend/services/CVProcessingService.ts
export class CVProcessingService extends BaseService implements ICVProcessingService {
  constructor(
    private aiClient: IAIClient,
    private storageService: IStorageService,
    private analysisService: IAnalysisService,
    logger: ILogger,
    validator: IValidator
  ) {
    super(logger, validator)
  }
  
  async processCV(request: CVProcessingRequest): Promise<Result<ProcessingResult>> {
    return this.executeWithErrorHandling(
      () => this.doProcessCV(request),
      'CV Processing'
    )
  }
  
  private async doProcessCV(request: CVProcessingRequest): Promise<ProcessingResult> {
    // Input validation
    const validation = this.validateInput(request, CVProcessingSchema)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }
    
    // Create domain entity
    const cv = new CV(
      CVId.generate(),
      new CVContent(request.content, request.format),
      new CVMetadata(request.userId, new Date())
    )
    
    // Process through domain service
    const analysis = await this.analysisService.analyze(cv)
    const generatedCV = await this.generateEnhancedCV(cv, analysis)
    
    // Persist results
    await this.storageService.save(cv)
    await this.storageService.save(analysis)
    
    return new ProcessingResult(cv, analysis, generatedCV)
  }
}
```

**Analysis Service Implementation**:
```typescript
// src/backend/services/CVAnalysisService.ts
export class CVAnalysisService extends BaseService implements ICVAnalysisService {
  constructor(
    private aiClient: IAIClient,
    private predictionEngine: IPredictionEngine,
    logger: ILogger,
    validator: IValidator
  ) {
    super(logger, validator)
  }
  
  async analyze(cv: CV): Promise<AnalysisResult> {
    return this.executeWithErrorHandling(
      () => this.doAnalysis(cv),
      `CV Analysis for ${cv.id}`
    )
  }
  
  private async doAnalysis(cv: CV): Promise<AnalysisResult> {
    const content = cv.getContent()
    
    // Parallel analysis execution
    const [
      skillsAnalysis,
      experienceAnalysis,
      educationAnalysis,
      predictions
    ] = await Promise.all([
      this.analyzeSkills(content),
      this.analyzeExperience(content),
      this.analyzeEducation(content),
      this.predictionEngine.generatePredictions(content)
    ])
    
    return new AnalysisResult(
      cv.id,
      skillsAnalysis,
      experienceAnalysis,
      educationAnalysis,
      predictions,
      new Date()
    )
  }
}
```

**Acceptance Criteria**:
- [ ] Base service class with error handling implemented
- [ ] Core services refactored to use dependency injection
- [ ] Service interfaces clearly defined
- [ ] Result pattern implemented for error handling

### Phase 2: Application Layer (Week 2 - Days 10-12)

#### Task 2.1: Use Case Implementation (Day 10 - 8 hours)

**Use Case Pattern**:
```typescript
// src/shared/application/use-cases/ProcessCVUseCase.ts
export class ProcessCVUseCase {
  constructor(
    private cvRepository: ICVRepository,
    private processingService: ICVProcessingService,
    private notificationService: INotificationService,
    private logger: ILogger
  ) {}
  
  async execute(command: ProcessCVCommand): Promise<ProcessCVResult> {
    // Validate command
    const validation = this.validateCommand(command)
    if (!validation.isValid) {
      return ProcessCVResult.failure(validation.errors)
    }
    
    // Check if CV already exists
    const existingCV = await this.cvRepository.findById(command.cvId)
    if (existingCV) {
      return ProcessCVResult.failure(['CV already processed'])
    }
    
    // Execute processing
    const processingResult = await this.processingService.processCV({
      content: command.content,
      format: command.format,
      userId: command.userId,
      options: command.options
    })
    
    if (processingResult.isFailure) {
      await this.handleProcessingFailure(command, processingResult.error)
      return ProcessCVResult.failure([processingResult.error.message])
    }
    
    // Save results
    await this.cvRepository.save(processingResult.value.cv)
    
    // Send notifications
    await this.notificationService.sendProcessingComplete({
      userId: command.userId,
      cvId: processingResult.value.cv.id,
      analysisResult: processingResult.value.analysis
    })
    
    return ProcessCVResult.success(processingResult.value)
  }
  
  private validateCommand(command: ProcessCVCommand): ValidationResult {
    // Implementation
  }
  
  private async handleProcessingFailure(
    command: ProcessCVCommand, 
    error: Error
  ): Promise<void> {
    this.logger.error('CV processing failed', { command, error })
    
    await this.notificationService.sendProcessingFailed({
      userId: command.userId,
      error: error.message
    })
  }
}
```

**Command and Query Separation**:
```typescript
// src/shared/application/commands/ProcessCVCommand.ts
export class ProcessCVCommand {
  constructor(
    public readonly cvId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly format: CVFormat,
    public readonly options: ProcessingOptions
  ) {}
}

// src/shared/application/queries/GetCVAnalysisQuery.ts
export class GetCVAnalysisQuery {
  constructor(
    public readonly cvId: string,
    public readonly userId: string
  ) {}
}

// src/shared/application/handlers/GetCVAnalysisHandler.ts
export class GetCVAnalysisHandler {
  constructor(
    private analysisRepository: IAnalysisRepository,
    private authService: IAuthService
  ) {}
  
  async handle(query: GetCVAnalysisQuery): Promise<AnalysisResult | null> {
    // Authorize access
    await this.authService.verifyUserAccess(query.userId, query.cvId)
    
    // Fetch analysis
    return await this.analysisRepository.findByCVId(query.cvId)
  }
}
```

**Acceptance Criteria**:
- [ ] All major use cases implemented with proper validation
- [ ] Command/Query separation established
- [ ] Use case handlers with authorization implemented
- [ ] Error handling and logging integrated

#### Task 2.2: Event-Driven Architecture (Day 11 - 6 hours)

**Domain Events**:
```typescript
// src/shared/domain/events/DomainEvent.ts
export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredOn: Date = new Date()
  ) {}
  
  abstract getEventName(): string
}

// src/shared/domain/events/CVProcessingEvents.ts
export class CVProcessingStarted extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly processingOptions: ProcessingOptions
  ) {
    super(aggregateId)
  }
  
  getEventName(): string {
    return 'CVProcessingStarted'
  }
}

export class CVProcessingCompleted extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly analysisResult: AnalysisResult
  ) {
    super(aggregateId)
  }
  
  getEventName(): string {
    return 'CVProcessingCompleted'
  }
}
```

**Event Bus Implementation**:
```typescript
// src/shared/infrastructure/events/EventBus.ts
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: IEventHandler<T>
  ): void
}

export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, IEventHandler<any>[]>()
  
  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName()
    const handlers = this.handlers.get(eventName) || []
    
    await Promise.all(
      handlers.map(handler => handler.handle(event))
    )
  }
  
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: IEventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler)
  }
}
```

**Event Handlers**:
```typescript
// src/shared/application/handlers/CVProcessingEventHandlers.ts
export class CVProcessingCompletedHandler implements IEventHandler<CVProcessingCompleted> {
  constructor(
    private notificationService: INotificationService,
    private analyticsService: IAnalyticsService
  ) {}
  
  async handle(event: CVProcessingCompleted): Promise<void> {
    // Send user notification
    await this.notificationService.sendProcessingComplete({
      userId: event.userId,
      cvId: event.aggregateId,
      analysisResult: event.analysisResult
    })
    
    // Track analytics
    await this.analyticsService.trackEvent('cv_processing_completed', {
      userId: event.userId,
      processingTime: event.analysisResult.processingTime,
      skillsCount: event.analysisResult.skills.length
    })
  }
}
```

**Acceptance Criteria**:
- [ ] Domain events defined for all major operations
- [ ] Event bus implementation working
- [ ] Event handlers for notifications and analytics
- [ ] Event persistence for audit trail

#### Task 2.3: Validation Framework (Day 12 - 4 hours)

**Comprehensive Validation System**:
```typescript
// src/shared/validation/ValidationEngine.ts
export interface ValidationRule<T> {
  validate(value: T): ValidationResult
}

export class ValidationEngine {
  private rules = new Map<string, ValidationRule<any>[]>()
  
  addRule<T>(type: string, rule: ValidationRule<T>): void {
    if (!this.rules.has(type)) {
      this.rules.set(type, [])
    }
    this.rules.get(type)!.push(rule)
  }
  
  validate<T>(value: T, type: string): ValidationResult {
    const rules = this.rules.get(type) || []
    const errors: string[] = []
    
    for (const rule of rules) {
      const result = rule.validate(value)
      if (!result.isValid) {
        errors.push(...result.errors)
      }
    }
    
    return new ValidationResult(errors.length === 0, errors)
  }
}
```

**CV-Specific Validation Rules**:
```typescript
// src/shared/validation/rules/CVValidationRules.ts
export class CVContentValidationRule implements ValidationRule<CVContent> {
  validate(content: CVContent): ValidationResult {
    const errors: string[] = []
    
    if (content.getSections().length === 0) {
      errors.push('CV must contain at least one section')
    }
    
    const requiredSections = ['experience', 'education', 'skills']
    const presentSections = content.getSections().map(s => s.type)
    
    for (const required of requiredSections) {
      if (!presentSections.includes(required)) {
        errors.push(`Missing required section: ${required}`)
      }
    }
    
    return new ValidationResult(errors.length === 0, errors)
  }
}

export class FileSizeValidationRule implements ValidationRule<File> {
  constructor(private maxSizeBytes: number) {}
  
  validate(file: File): ValidationResult {
    if (file.size > this.maxSizeBytes) {
      return ValidationResult.failure([
        `File size ${file.size} exceeds maximum ${this.maxSizeBytes} bytes`
      ])
    }
    
    return ValidationResult.success()
  }
}
```

**Acceptance Criteria**:
- [ ] Flexible validation engine implemented
- [ ] CV-specific validation rules created
- [ ] File and input validation integrated
- [ ] Validation error reporting standardized

### Phase 3: Infrastructure Modernization (Week 3 - Days 13-14)

#### Task 3.1: Repository Pattern Implementation (Day 13 - 8 hours)

**Firebase Repository Implementation**:
```typescript
// src/infrastructure/repositories/FirebaseCVRepository.ts
export class FirebaseCVRepository implements ICVRepository {
  constructor(
    private firestore: FirebaseFirestore.Firestore,
    private logger: ILogger
  ) {}
  
  async save(cv: CV): Promise<void> {
    try {
      const docRef = this.firestore.collection('cvs').doc(cv.id.value)
      await docRef.set(this.cvToDocument(cv))
      this.logger.info(`CV saved: ${cv.id.value}`)
    } catch (error) {
      this.logger.error(`Failed to save CV: ${cv.id.value}`, error)
      throw new RepositoryError('Failed to save CV', error)
    }
  }
  
  async findById(id: CVId): Promise<CV | null> {
    try {
      const docRef = this.firestore.collection('cvs').doc(id.value)
      const doc = await docRef.get()
      
      if (!doc.exists) {
        return null
      }
      
      return this.documentToCV(doc.data()!)
    } catch (error) {
      this.logger.error(`Failed to find CV: ${id.value}`, error)
      throw new RepositoryError('Failed to find CV', error)
    }
  }
  
  async findByUserId(userId: UserId): Promise<CV[]> {
    try {
      const query = this.firestore
        .collection('cvs')
        .where('userId', '==', userId.value)
        .orderBy('createdAt', 'desc')
      
      const snapshot = await query.get()
      
      return snapshot.docs.map(doc => this.documentToCV(doc.data()))
    } catch (error) {
      this.logger.error(`Failed to find CVs for user: ${userId.value}`, error)
      throw new RepositoryError('Failed to find user CVs', error)
    }
  }
  
  private cvToDocument(cv: CV): any {
    return {
      id: cv.id.value,
      content: cv.getContent().serialize(),
      metadata: cv.getMetadata().serialize(),
      status: cv.getStatus(),
      createdAt: cv.getCreatedAt(),
      updatedAt: new Date()
    }
  }
  
  private documentToCV(doc: any): CV {
    return new CV(
      new CVId(doc.id),
      CVContent.deserialize(doc.content),
      CVMetadata.deserialize(doc.metadata),
      doc.status
    )
  }
}
```

**Caching Repository Decorator**:
```typescript
// src/infrastructure/repositories/CachedCVRepository.ts
export class CachedCVRepository implements ICVRepository {
  constructor(
    private baseRepository: ICVRepository,
    private cache: ICache,
    private cacheConfig: CacheConfig
  ) {}
  
  async save(cv: CV): Promise<void> {
    await this.baseRepository.save(cv)
    
    // Update cache
    const cacheKey = `cv:${cv.id.value}`
    await this.cache.set(cacheKey, cv, this.cacheConfig.cvTTL)
    
    // Invalidate user cache
    const userCacheKey = `user_cvs:${cv.getUserId().value}`
    await this.cache.delete(userCacheKey)
  }
  
  async findById(id: CVId): Promise<CV | null> {
    const cacheKey = `cv:${id.value}`
    const cached = await this.cache.get<CV>(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const cv = await this.baseRepository.findById(id)
    if (cv) {
      await this.cache.set(cacheKey, cv, this.cacheConfig.cvTTL)
    }
    
    return cv
  }
  
  async findByUserId(userId: UserId): Promise<CV[]> {
    const cacheKey = `user_cvs:${userId.value}`
    const cached = await this.cache.get<CV[]>(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const cvs = await this.baseRepository.findByUserId(userId)
    await this.cache.set(cacheKey, cvs, this.cacheConfig.userCvsTTL)
    
    return cvs
  }
}
```

**Acceptance Criteria**:
- [ ] All repositories implement domain interfaces
- [ ] Repository error handling and logging
- [ ] Caching layer with proper invalidation
- [ ] Repository unit tests with high coverage

#### Task 3.2: External Service Abstraction (Day 14 - 6 hours)

**AI Service Abstraction**:
```typescript
// src/infrastructure/services/AIServiceAdapter.ts
export class AnthropicAIAdapter implements IAIClient {
  constructor(
    private anthropicClient: Anthropic,
    private logger: ILogger,
    private rateLimiter: IRateLimiter
  ) {}
  
  async analyze(content: string): Promise<AnalysisResult> {
    await this.rateLimiter.checkLimit('ai_analysis')
    
    try {
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-sonnet-20241022',
        messages: [{
          role: 'user',
          content: this.buildAnalysisPrompt(content)
        }],
        max_tokens: 4000
      })
      
      return this.parseAnalysisResponse(response.content[0].text)
    } catch (error) {
      this.logger.error('AI analysis failed', error)
      throw new AIServiceError('Analysis failed', error)
    }
  }
  
  async generate(prompt: string): Promise<string> {
    await this.rateLimiter.checkLimit('ai_generation')
    
    try {
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-sonnet-20241022',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })
      
      return response.content[0].text
    } catch (error) {
      this.logger.error('AI generation failed', error)
      throw new AIServiceError('Generation failed', error)
    }
  }
  
  private buildAnalysisPrompt(content: string): string {
    return `
      Analyze this CV content and provide structured analysis:
      
      Content: ${content}
      
      Please provide analysis in the following JSON format:
      {
        "skills": [...],
        "experience": {...},
        "education": {...},
        "recommendations": [...]
      }
    `
  }
  
  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      const parsed = JSON.parse(response)
      return new AnalysisResult(parsed)
    } catch (error) {
      throw new AIServiceError('Failed to parse AI response', error)
    }
  }
}
```

**Circuit Breaker Implementation**:
```typescript
// src/infrastructure/resilience/CircuitBreaker.ts
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private failureCount = 0
  private nextAttempt = 0
  
  constructor(
    private config: CircuitBreakerConfig,
    private logger: ILogger
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN')
      } else {
        this.state = CircuitBreakerState.HALF_OPEN
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0
    this.state = CircuitBreakerState.CLOSED
  }
  
  private onFailure(): void {
    this.failureCount++
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN
      this.nextAttempt = Date.now() + this.config.timeout
      this.logger.warn('Circuit breaker opened due to failures')
    }
  }
}
```

**Acceptance Criteria**:
- [ ] External service adapters implemented
- [ ] Circuit breaker pattern for resilience
- [ ] Rate limiting for external APIs
- [ ] Comprehensive error handling and logging

## Resource Requirements

### Developer Hours Breakdown
- **Senior Software Architect**: 40 hours (Architecture design and oversight)
- **Backend Architecture Specialist**: 32 hours (Service layer and repositories)
- **Domain Modeling Expert**: 24 hours (Domain entities and business logic)
- **Infrastructure Engineer**: 20 hours (External service integration)
- **Code Quality Engineer**: 16 hours (Refactoring and validation)
- **Total**: 132 developer hours

### Skill Sets Required
- **Clean Architecture**: Deep understanding of layered architecture patterns
- **Domain-Driven Design**: Entity modeling and domain service design
- **Dependency Injection**: IoC container design and implementation
- **Event-Driven Architecture**: Event sourcing and CQRS patterns
- **Repository Pattern**: Data access abstraction and caching strategies

## Benefits & Expected Outcomes

### Immediate Benefits (Week 2-3)
- **Testability**: 90% improvement in unit test capability
- **Maintainability**: 60% reduction in change complexity
- **Flexibility**: Easy addition of new features and services
- **Error Handling**: Consistent, predictable error behavior

### Long-term Benefits (Month 2-3)
- **Scalability**: Architecture supports horizontal scaling
- **Team Productivity**: 40% faster feature development
- **Code Quality**: Reduced bug density and improved reliability
- **Onboarding**: New developers can understand and contribute faster

### Technical Debt Reduction
- **Coupling**: Reduced from high coupling to loose coupling
- **Cohesion**: Improved from mixed concerns to high cohesion
- **Complexity**: Simplified through proper abstraction layers
- **Duplication**: Eliminated through shared service layer

## Risk Mitigation

### Architecture Migration Risks
1. **Breaking Changes During Refactoring**
   - **Risk**: Existing functionality breaks during migration
   - **Mitigation**: Incremental migration with adapter patterns
   - **Rollback**: Keep old implementations until full validation

2. **Performance Impact of Abstraction**
   - **Risk**: Additional layers impact performance
   - **Mitigation**: Performance monitoring and optimization
   - **Rollback**: Remove abstractions if performance degrades >15%

3. **Team Learning Curve**
   - **Risk**: Team unfamiliar with new patterns
   - **Mitigation**: Training sessions and documentation
   - **Rollback**: Gradual adoption with mentoring support

## Success Criteria

### Architecture Quality Metrics
- [ ] **Dependency Graph**: Clean, acyclic dependencies
- [ ] **Coupling Metrics**: Afferent/Efferent coupling within acceptable ranges
- [ ] **Cohesion Metrics**: High cohesion within modules
- [ ] **Complexity Metrics**: Reduced cyclomatic complexity

### Development Velocity Metrics
- [ ] **Feature Development Time**: 40% reduction in average time
- [ ] **Bug Fix Time**: 50% reduction in resolution time
- [ ] **Test Coverage**: Maintain >90% with improved test reliability
- [ ] **Code Review Time**: 30% reduction in review cycles

### Quality Metrics
- [ ] **Production Issues**: 70% reduction in architecture-related bugs
- [ ] **Performance**: No degradation, potential improvement
- [ ] **Maintainability Index**: Significant improvement in code metrics
- [ ] **Documentation**: Complete architecture documentation available

## Conclusion

This architecture modernization plan transforms the cv-processing package from a tightly-coupled, monolithic structure into a modern, maintainable, and scalable architecture. The investment in proper abstraction layers, dependency injection, and clean architecture patterns will pay dividends in reduced maintenance costs, improved development velocity, and enhanced system reliability.

The 132-hour implementation timeline provides a solid foundation for long-term growth while addressing the immediate architectural debt that contributes to the overall quality issues identified in the code review. Success in this modernization effort will establish cv-processing as a model for enterprise-grade software architecture within the CVPlus ecosystem.