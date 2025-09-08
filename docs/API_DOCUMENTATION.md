# InsightSynth API Documentation

## Overview

InsightSynth provides a comprehensive API for AI-powered research synthesis, note management, and task prioritization. This documentation covers all available endpoints, data models, and integration patterns.

## Table of Contents

1. [Authentication](#authentication)
2. [Data Models](#data-models)
3. [Core Services](#core-services)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Integration Examples](#integration-examples)

## Authentication

### API Key Management

```javascript
// Environment Configuration
const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: "google/gemini-2.0-flash-001"
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 3600000 // 1 hour
  }
};
```

### Subscription Tiers

| Tier | Features | Rate Limits | Cost |
|------|----------|-------------|------|
| Free | Basic synthesis, 10 notes | 10 requests/hour | $0 |
| Pro | Advanced AI, unlimited storage | 100 requests/hour | $10/month |
| Team | Collaboration, priority support | 500 requests/hour | $30/month |

## Data Models

### User Model

```typescript
interface User {
  userId: string;
  email: string;
  subscriptionTier: 'free' | 'pro' | 'team';
  createdAt: string;
  updatedAt: string;
}
```

### Project Model

```typescript
interface Project {
  projectId: string;
  userId: string;
  name: string;
  description: string;
  goal: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
```

### Note Model

```typescript
interface Note {
  noteId: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string;
  sourceUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Task Model

```typescript
interface Task {
  taskId: string;
  projectId: string;
  description: string;
  isCompleted: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Core Services

### AI Service

#### Text Synthesis

```javascript
import { synthesizeText } from './services/aiService';

/**
 * Synthesizes text using AI
 * @param {string} text - Input text to synthesize
 * @param {string} prompt - Optional custom prompt
 * @returns {Promise<string>} - Synthesized summary
 */
const result = await synthesizeText(text, customPrompt);
```

**Parameters:**
- `text` (required): The input text to analyze and synthesize
- `prompt` (optional): Custom instructions for the AI

**Response:**
```json
{
  "summary": "Structured summary of the input text...",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionableInsights": ["Insight 1", "Insight 2"],
  "wordCount": 150
}
```

#### Task Prioritization

```javascript
import { prioritizeTasks } from './services/aiService';

/**
 * AI-powered task prioritization
 * @param {Task[]} tasks - Array of tasks to prioritize
 * @param {string} projectGoal - Project objective
 * @returns {Promise<string>} - Prioritization recommendations
 */
const recommendations = await prioritizeTasks(tasks, projectGoal);
```

**Parameters:**
- `tasks` (required): Array of task objects
- `projectGoal` (required): Project objective for context

**Response:**
```json
{
  "prioritizedTasks": [
    {
      "taskId": "task-1",
      "recommendedPriority": "high",
      "reasoning": "Critical path dependency",
      "estimatedImpact": 9
    }
  ],
  "workflowOptimizations": ["Suggestion 1", "Suggestion 2"]
}
```

#### Task Suggestions

```javascript
import { generateTaskSuggestions } from './services/aiService';

/**
 * Generate task suggestions based on project goal
 * @param {string} projectGoal - Project objective
 * @param {Task[]} existingTasks - Current tasks
 * @returns {Promise<string>} - Task suggestions
 */
const suggestions = await generateTaskSuggestions(projectGoal, existingTasks);
```

### Web Scraping Service

#### URL Content Extraction

```javascript
import { scrapeWebContent } from './services/webScrapingService';

/**
 * Extract content from web URLs
 * @param {string} url - URL to scrape
 * @returns {Promise<Object>} - Extracted content
 */
const content = await scrapeWebContent(url);
```

**Parameters:**
- `url` (required): Valid HTTP/HTTPS URL

**Response:**
```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": "Extracted main content...",
  "extractedAt": "2024-01-15T10:30:00Z",
  "wordCount": 1250
}
```

#### File Text Extraction

```javascript
import { extractTextFromFile } from './services/webScrapingService';

/**
 * Extract text from uploaded files
 * @param {File} file - File object
 * @returns {Promise<Object>} - Extracted text
 */
const extracted = await extractTextFromFile(file);
```

**Supported File Types:**
- Plain text (.txt)
- Markdown (.md)
- JSON (.json)
- PDF (.pdf) - Production only
- DOCX (.docx) - Production only

## API Endpoints

### Projects

#### GET /api/projects
Get all projects for the authenticated user.

```javascript
// Response
{
  "projects": [
    {
      "projectId": "proj-123",
      "name": "Research Project",
      "description": "AI research synthesis",
      "goal": "Analyze ML papers",
      "dueDate": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/projects
Create a new project.

```javascript
// Request Body
{
  "name": "New Project",
  "description": "Project description",
  "goal": "Project objective",
  "dueDate": "2024-02-01T00:00:00Z"
}

// Response
{
  "projectId": "proj-456",
  "message": "Project created successfully"
}
```

### Notes

#### GET /api/notes
Get all notes, optionally filtered by project.

```javascript
// Query Parameters
?projectId=proj-123&limit=50&offset=0

// Response
{
  "notes": [
    {
      "noteId": "note-123",
      "title": "Research Summary",
      "content": "Note content...",
      "tags": ["research", "ai"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "hasMore": false
}
```

#### POST /api/notes
Create a new note.

```javascript
// Request Body
{
  "title": "Note Title",
  "content": "Note content",
  "projectId": "proj-123",
  "tags": ["tag1", "tag2"],
  "sourceUrl": "https://example.com"
}

// Response
{
  "noteId": "note-456",
  "message": "Note created successfully"
}
```

#### PUT /api/notes/:noteId
Update an existing note.

```javascript
// Request Body
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated", "tags"]
}

// Response
{
  "message": "Note updated successfully"
}
```

#### DELETE /api/notes/:noteId
Delete a note.

```javascript
// Response
{
  "message": "Note deleted successfully"
}
```

### Tasks

#### GET /api/tasks
Get tasks for a project.

```javascript
// Query Parameters
?projectId=proj-123&status=pending&priority=high

// Response
{
  "tasks": [
    {
      "taskId": "task-123",
      "description": "Complete research",
      "isCompleted": false,
      "priority": "high",
      "dueDate": "2024-01-15T00:00:00Z",
      "dependencies": ["task-456"]
    }
  ]
}
```

#### POST /api/tasks
Create a new task.

```javascript
// Request Body
{
  "projectId": "proj-123",
  "description": "Task description",
  "dueDate": "2024-01-15T00:00:00Z",
  "priority": "medium",
  "dependencies": []
}

// Response
{
  "taskId": "task-789",
  "message": "Task created successfully"
}
```

### AI Synthesis

#### POST /api/ai/synthesize
Synthesize text using AI.

```javascript
// Request Body
{
  "text": "Long text to synthesize...",
  "prompt": "Custom synthesis instructions",
  "saveAsNote": true,
  "projectId": "proj-123"
}

// Response
{
  "synthesisId": "synth-123",
  "summary": "AI-generated summary...",
  "keyInsights": ["Insight 1", "Insight 2"],
  "noteId": "note-789" // if saveAsNote is true
}
```

#### POST /api/ai/prioritize
Get AI task prioritization.

```javascript
// Request Body
{
  "projectId": "proj-123",
  "tasks": [
    {
      "taskId": "task-1",
      "description": "Task 1",
      "dueDate": "2024-01-15T00:00:00Z",
      "dependencies": []
    }
  ],
  "projectGoal": "Complete research analysis"
}

// Response
{
  "recommendations": "AI prioritization analysis...",
  "suggestedOrder": ["task-2", "task-1", "task-3"],
  "reasoning": {
    "task-1": "High impact, no dependencies",
    "task-2": "Critical path item"
  }
}
```

## Error Handling

### Error Response Format

```javascript
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `AI_SERVICE_ERROR` | 502 | AI service unavailable |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Best Practices

```javascript
try {
  const result = await synthesizeText(text);
  // Handle success
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Show rate limit message
    console.log('Rate limit exceeded. Please try again later.');
  } else if (error.code === 'AI_SERVICE_ERROR') {
    // Fallback to cached results or manual input
    console.log('AI service temporarily unavailable.');
  } else {
    // Generic error handling
    console.error('An error occurred:', error.message);
  }
}
```

## Rate Limiting

### Limits by Subscription Tier

| Tier | Synthesis | Web Scraping | Task AI | Notes |
|------|-----------|--------------|---------|-------|
| Free | 10/hour | 5/hour | 5/hour | 50 total |
| Pro | 100/hour | 50/hour | 50/hour | Unlimited |
| Team | 500/hour | 200/hour | 200/hour | Unlimited |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

```javascript
import { webScrapingRateLimiter } from './services/webScrapingService';

if (!webScrapingRateLimiter.canMakeRequest()) {
  throw new Error('Rate limit exceeded. Please try again later.');
}

webScrapingRateLimiter.recordRequest();
// Proceed with request
```

## Integration Examples

### React Hook for AI Synthesis

```javascript
import { useState } from 'react';
import { synthesizeText } from '../services/aiService';

export function useAISynthesis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const synthesize = async (text, prompt = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await synthesizeText(text, prompt);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { synthesize, isLoading, error };
}
```

### Batch Processing

```javascript
async function processBatchDocuments(documents) {
  const results = [];
  const batchSize = 5;
  
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (doc) => {
      try {
        return await synthesizeText(doc.content);
      } catch (error) {
        return { error: error.message, document: doc.id };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting delay
    if (i + batchSize < documents.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
```

### WebSocket Integration (Future)

```javascript
// Real-time collaboration features
const ws = new WebSocket('wss://api.insightsynth.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'note_updated':
      // Handle real-time note updates
      updateNoteInUI(data.note);
      break;
    case 'synthesis_complete':
      // Handle completed AI synthesis
      displaySynthesisResult(data.result);
      break;
  }
};
```

## Production Deployment

### Environment Variables

```bash
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=google/gemini-2.0-flash-001
AI_BASE_URL=https://openrouter.ai/api/v1

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/insightsynth
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# External Services
SCRAPING_SERVICE_URL=https://api.scrapingbee.com
SCRAPING_API_KEY=your_scraping_api_key

# Rate Limiting
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Health Check Endpoint

```javascript
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "ai_service": "available",
    "redis": "connected"
  },
  "version": "1.0.0"
}
```

## Support and Resources

- **Documentation**: https://docs.insightsynth.com
- **API Status**: https://status.insightsynth.com
- **Support**: support@insightsynth.com
- **GitHub**: https://github.com/insightsynth/api
- **Discord**: https://discord.gg/insightsynth

---

*Last updated: January 2024*
*API Version: 1.0.0*
