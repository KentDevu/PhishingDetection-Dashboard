# Development Instructions for Phishing Client Data Layer

## Overview

This document outlines the architecture and guidelines for implementing the data layer for the phishing client application. The data layer will handle interactions with the Email Database Management API, providing a clean, maintainable, and scalable solution.

## Architecture Principles

### 1. Separation of Concerns

- **Models/Types**: Pure TypeScript interfaces and types
- **Services**: API communication logic
- **Hooks**: React-specific data management and state
- **Components**: UI logic only

### 2. Clean Code Practices

- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Prefer composition over inheritance
- Use async/await for asynchronous operations
- Implement proper error handling

### 3. TypeScript Best Practices

- Use strict typing throughout
- Avoid `any` type except in rare cases
- Define interfaces for all API responses
- Use union types for status/enums

### 4. React Patterns

- Custom hooks for data fetching and mutations
- Proper loading and error state management
- Avoid prop drilling with context if needed
- Use functional components with hooks

## Design Patterns

### Repository Pattern

The data service acts as a repository, abstracting the data access logic from the business logic.

### Custom Hooks Pattern

React hooks encapsulate data fetching logic, providing a clean API for components.

### Error Boundary Pattern

Implement error boundaries for graceful error handling in the UI.

## File Structure

```
src/
├── models/
│   ├── email.ts          # Email-related interfaces
│   └── api.ts            # API response types
├── services/
│   ├── apiService.ts     # Base API service
│   └── emailService.ts   # Email-specific API calls
├── hooks/
│   ├── useEmails.ts      # Hook for fetching emails
│   ├── useDeleteEmail.ts # Hook for deleting single email
│   └── useBulkDelete.ts  # Hook for bulk delete
└── utils/
    ├── apiUtils.ts       # API utility functions
    └── errorUtils.ts     # Error handling utilities
```

## API Integration Guidelines

### Base URL

- Development: `http://localhost:3000/api`
- Use environment variables for different environments

### HTTP Methods

- GET for data retrieval
- DELETE for data removal
- No POST/PUT in current scope

### Error Handling

- Network errors: Retry with exponential backoff
- 4xx errors: User-friendly messages
- 5xx errors: Generic error with retry option
- Validation errors: Specific field-level feedback

### Response Validation

- Validate response structure against TypeScript interfaces
- Handle partial responses gracefully
- Log unexpected response formats

## State Management

### Loading States

- `idle`: Initial state
- `loading`: Request in progress
- `success`: Request completed successfully
- `error`: Request failed

### Error States

- `network`: Network connectivity issues
- `server`: Server-side errors
- `validation`: Client-side validation errors
- `unknown`: Unexpected errors

## Security Considerations

### Input Validation

- Validate all input parameters
- Sanitize data before sending to API
- Use TypeScript for compile-time validation

### Error Messages

- Avoid exposing sensitive information
- Provide user-friendly error messages
- Log detailed errors for debugging

## Testing Strategy

### Unit Tests

- Test service methods with mocked API responses
- Test hooks with React Testing Library
- Test utility functions

### Integration Tests

- Test API service with real endpoints (staging)
- Test component integration with hooks

### E2E Tests

- Test complete user flows
- Verify error handling in UI

## Performance Optimizations

### Caching

- Implement simple in-memory caching for GET requests
- Cache invalidation on mutations

### Pagination

- Implement pagination for large datasets
- Virtual scrolling for long lists

### Debouncing

- Debounce search/filter inputs
- Throttle rapid API calls

## Code Quality

### Linting and Formatting

- Use ESLint for code quality
- Use Prettier for consistent formatting
- Configure TypeScript strict mode

### Code Reviews

- Self-review before committing
- Use descriptive commit messages
- Follow conventional commit format

## Deployment Considerations

### Environment Variables

- API base URL
- Timeout configurations
- Retry settings

### Build Optimization

- Tree shaking for unused code
- Code splitting for large bundles
- Minification and compression

## Future Enhancements

### Potential Improvements

- Add authentication/authorization
- Implement real-time updates (WebSocket)
- Add offline support (Service Worker)
- Implement advanced caching (React Query/TanStack Query)
- Add request/response interceptors

### Scalability

- Modular service architecture
- Easy to extend for new endpoints
- Consistent error handling across services

## Implementation Steps

1. Define all TypeScript interfaces and types
2. Implement base API service with common functionality
3. Create email-specific service methods
4. Build custom hooks with proper state management
5. Add comprehensive error handling
6. Implement loading states and user feedback
7. Add unit tests for all new code
8. Integrate with existing components
9. Performance testing and optimization
10. Documentation updates

## Monitoring and Logging

### Error Tracking

- Log all API errors with context
- Track error rates and patterns
- Alert on critical failures

### Performance Monitoring

- Track API response times
- Monitor memory usage
- Identify performance bottlenecks

This document will be updated as the implementation progresses and new requirements emerge.
