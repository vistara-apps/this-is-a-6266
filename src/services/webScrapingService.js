/**
 * Web Scraping Service for InsightSynth
 * Handles URL content extraction for AI synthesis
 */

// Mock web scraping service - In production, this would use a backend service
// with Puppeteer, Playwright, or a third-party API like ScrapingBee

export async function scrapeWebContent(url) {
  try {
    // Validate URL
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      throw new Error('Please provide a valid HTTP/HTTPS URL');
    }

    // In a real implementation, this would call a backend endpoint
    // that uses Puppeteer/Playwright or a scraping service
    
    // For demo purposes, we'll simulate the scraping process
    const response = await simulateWebScraping(url);
    
    return {
      url,
      title: response.title,
      content: response.content,
      extractedAt: new Date().toISOString(),
      wordCount: response.content.split(' ').length,
    };
  } catch (error) {
    console.error('Web scraping error:', error);
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
}

// Simulate web scraping for demo purposes
async function simulateWebScraping(url) {
  // Add artificial delay to simulate real scraping
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock responses based on common domains
  const mockResponses = {
    'arxiv.org': {
      title: 'Research Paper: Advanced Machine Learning Techniques',
      content: `Abstract: This paper presents novel approaches to machine learning optimization. We introduce a new algorithm that improves training efficiency by 40% while maintaining accuracy. The methodology combines gradient descent with adaptive learning rates and regularization techniques. Our experiments on benchmark datasets demonstrate significant improvements over existing methods. Key findings include: 1) Faster convergence rates, 2) Better generalization, 3) Reduced overfitting. The proposed approach has applications in computer vision, natural language processing, and recommendation systems. Future work will explore distributed training scenarios and real-time inference optimization.`
    },
    'medium.com': {
      title: 'The Future of AI in Product Development',
      content: `Artificial Intelligence is revolutionizing how we approach product development. From ideation to deployment, AI tools are streamlining workflows and enhancing creativity. Key trends include: automated testing, intelligent design suggestions, and predictive analytics for user behavior. Companies adopting AI-first approaches report 60% faster development cycles and improved user satisfaction. However, challenges remain in data privacy, model interpretability, and integration complexity. Best practices include starting with small pilot projects, investing in team training, and establishing clear governance frameworks.`
    },
    'github.com': {
      title: 'Open Source Project Documentation',
      content: `This repository contains a comprehensive framework for building scalable web applications. Features include: modular architecture, built-in authentication, real-time updates, and extensive testing suite. Installation is straightforward with npm install and npm start commands. The project follows industry best practices for code organization, security, and performance optimization. Contributing guidelines are available in CONTRIBUTING.md. Recent updates include TypeScript support, improved error handling, and enhanced documentation.`
    }
  };

  // Check if URL matches any mock domain
  for (const [domain, response] of Object.entries(mockResponses)) {
    if (url.includes(domain)) {
      return response;
    }
  }

  // Default response for unknown URLs
  return {
    title: 'Web Content Analysis',
    content: `This is a sample extraction from the provided URL. In a production environment, this service would use tools like Puppeteer or Playwright to extract the actual content from web pages. The extracted content would include the main text, headings, and relevant metadata while filtering out navigation elements, advertisements, and other non-essential content. The service respects robots.txt files and implements rate limiting to avoid overwhelming target servers.`
  };
}

export async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        // Basic text extraction - in production, you'd handle different file types
        if (file.type === 'text/plain' || file.type === 'text/markdown') {
          resolve({
            filename: file.name,
            content: content,
            size: file.size,
            type: file.type,
            extractedAt: new Date().toISOString(),
          });
        } else if (file.type === 'application/json') {
          const parsed = JSON.parse(content);
          resolve({
            filename: file.name,
            content: JSON.stringify(parsed, null, 2),
            size: file.size,
            type: file.type,
            extractedAt: new Date().toISOString(),
          });
        } else {
          // For other file types, you'd use appropriate libraries
          // PDF: pdf-parse, DOCX: mammoth, etc.
          resolve({
            filename: file.name,
            content: 'File type not supported in demo. In production, this would extract text from PDF, DOCX, and other formats.',
            size: file.size,
            type: file.type,
            extractedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        reject(new Error(`Failed to extract text from file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Rate limiting utility
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }
}

export const webScrapingRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
