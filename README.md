# InsightSynth

**Unleash your writing potential with AI-powered research and focused productivity.**

InsightSynth is a comprehensive web application designed to help writers, researchers, and project managers synthesize information, organize notes, and prioritize tasks effectively using advanced AI capabilities.

![InsightSynth Dashboard](docs/images/dashboard-preview.png)

## 🚀 Features

### Core Capabilities
- **🧠 AI Research Synthesis**: Condense long documents and articles into digestible summaries
- **📝 Centralized Note Taking**: Unified dashboard for capturing and organizing ideas
- **🎯 Intelligent Task Prioritization**: AI-powered task ordering based on goals and dependencies
- **🔍 Distraction-Free Writing**: Minimalist interface with focus mode and timer
- **🌐 Web Scraping**: Extract content directly from URLs for analysis
- **⚡ Real-time Processing**: Instant AI analysis and synthesis

### Advanced Features
- **📊 Productivity Analytics**: Track progress and get insights
- **🏷️ Smart Tagging**: Automatic categorization and organization
- **🔄 Batch Processing**: Handle multiple documents simultaneously
- **📱 Responsive Design**: Works seamlessly across all devices
- **🎨 Customizable Interface**: Personalized themes and layouts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Context API** - State management

### AI & Services
- **OpenAI API** - Advanced language models
- **Google Gemini** - Alternative AI provider
- **Web Scraping** - Puppeteer/Playwright integration
- **Rate Limiting** - Built-in usage controls

### Production Infrastructure
- **Docker** - Containerized deployment
- **PostgreSQL** - Persistent data storage
- **Redis** - Caching and session management
- **Nginx** - Reverse proxy and load balancing
- **Prometheus & Grafana** - Monitoring and analytics

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (or **yarn** 1.22.0+)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-6266.git
cd this-is-a-6266
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# AI Service Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_AI_MODEL=google/gemini-2.0-flash-001
VITE_AI_BASE_URL=https://openrouter.ai/api/v1

# Application Settings
VITE_APP_NAME=InsightSynth
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_WEB_SCRAPING=true
VITE_ENABLE_BATCH_PROCESSING=true
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📖 Usage Guide

### Getting Started

1. **Create Your First Project**
   - Click "New Project" in the sidebar
   - Set a clear goal and deadline
   - Start adding notes and tasks

2. **AI-Powered Research**
   - Use the Document Uploader to analyze text
   - Paste URLs for automatic web scraping
   - Upload files (TXT, MD, PDF, DOCX)
   - Get instant AI summaries

3. **Smart Task Management**
   - Add tasks with priorities and dependencies
   - Use AI prioritization for optimal workflow
   - Track progress with completion metrics

4. **Focus Mode**
   - Enable distraction-free writing
   - Set Pomodoro timers
   - Customize your workspace

### Subscription Tiers

| Feature | Free | Pro ($10/mo) | Team ($30/mo) |
|---------|------|--------------|---------------|
| Projects | 3 | 25 | Unlimited |
| AI Synthesis | 10/month | 1,000/month | 5,000/month |
| Web Scraping | 5/month | 500/month | 2,000/month |
| File Upload | 5MB | 50MB | 100MB |
| Collaboration | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

## 🏗️ Project Structure

```
insightsynth/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── AppShell.jsx   # Main layout
│   │   ├── DocumentUploader.jsx
│   │   ├── TaskPrioritizer.jsx
│   │   ├── FocusModeToggle.jsx
│   │   └── ...
│   ├── context/           # React context
│   │   └── AppContext.jsx
│   ├── services/          # Business logic
│   │   ├── aiService.js
│   │   ├── webScrapingService.js
│   │   └── businessLogic.js
│   ├── styles/           # CSS and themes
│   └── utils/            # Helper functions
├── docs/                 # Documentation
│   ├── API_DOCUMENTATION.md
│   └── images/
├── docker-compose.prod.yml
├── Dockerfile
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Conventional Commits** for commit messages

### Component Development

Components follow these patterns:

```jsx
// Component structure
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from 'lucide-react';

export default function ComponentName({ variant = 'default', ...props }) {
  const { state, dispatch } = useApp();
  const [localState, setLocalState] = useState(null);

  // Component logic here

  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
}
```

## 🚀 Deployment

### Production Deployment

1. **Build the Application**
```bash
npm run build
```

2. **Docker Deployment**
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

3. **Environment Variables**
```bash
# Required production environment variables
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_PASSWORD=your_redis_password
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
GRAFANA_PASSWORD=your_grafana_password
```

### Monitoring

Access monitoring dashboards:
- **Application**: `http://localhost:3000`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`

## 📚 API Documentation

Comprehensive API documentation is available at [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

### Quick API Examples

```javascript
// AI Synthesis
import { synthesizeText } from './services/aiService';
const summary = await synthesizeText(longText, customPrompt);

// Web Scraping
import { scrapeWebContent } from './services/webScrapingService';
const content = await scrapeWebContent('https://example.com');

// Business Logic
import BusinessLogicService from './services/businessLogic';
const canCreate = BusinessLogicService.canCreateProject(user, projectCount);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-6266/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/vistara-apps/this-is-a-6266/discussions)
- **Documentation**: [docs/](docs/)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing advanced language models
- **React Team** for the excellent framework
- **Tailwind CSS** for the utility-first styling approach
- **Lucide** for beautiful icons
- **Vite** for the fast build tool

## 🔮 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Real-time collaboration
- [ ] Advanced export formats
- [ ] Mobile app (React Native)
- [ ] Offline mode support

### Version 1.2 (Q3 2024)
- [ ] Plugin system
- [ ] Advanced analytics
- [ ] Team management
- [ ] API rate limiting dashboard

### Version 2.0 (Q4 2024)
- [ ] Multi-language support
- [ ] Advanced AI models
- [ ] Enterprise features
- [ ] White-label solutions

---

**Built with ❤️ by the InsightSynth Team**

For more information, visit our [website](https://insightsynth.com) or follow us on [Twitter](https://twitter.com/insightsynth).
