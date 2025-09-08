import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { synthesizeText } from '../services/aiService';
import { scrapeWebContent, extractTextFromFile, webScrapingRateLimiter } from '../services/webScrapingService';
import BusinessLogicService from '../services/businessLogic';
import { Upload, FileText, Link, Loader2, AlertCircle, Globe } from 'lucide-react';

export default function DocumentUploader() {
  const { state, dispatch } = useApp();
  const [uploadType, setUploadType] = useState('text'); // 'text', 'file', 'url'
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleUrlScraping = async () => {
    if (!inputUrl.trim()) {
      setError('Please provide a URL to scrape');
      return;
    }

    // Check business logic permissions
    const canScrape = BusinessLogicService.canUseWebScraping(state.user);
    if (!canScrape.allowed) {
      setError(canScrape.message);
      return;
    }

    // Check rate limiting
    if (!webScrapingRateLimiter.canMakeRequest()) {
      setError('Rate limit exceeded. Please try again later.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const scrapedContent = await scrapeWebContent(inputUrl);
      setInputText(scrapedContent.content);
      
      // Record usage
      BusinessLogicService.recordUsage(state.user, 'webScraping');
      webScrapingRateLimiter.recordRequest();
      
      // Auto-synthesize if content is available
      if (scrapedContent.content) {
        const result = await synthesizeText(scrapedContent.content, customPrompt);
        
        // Save synthesis result
        const synthesisId = Date.now().toString();
        dispatch({
          type: 'SET_SYNTHESIS_RESULT',
          payload: {
            id: synthesisId,
            result: {
              originalText: scrapedContent.content,
              summary: result,
              prompt: customPrompt,
              sourceUrl: inputUrl,
              sourceTitle: scrapedContent.title,
              createdAt: new Date().toISOString(),
            }
          }
        });

        // Record synthesis usage
        BusinessLogicService.recordUsage(state.user, 'synthesis');

        // Optionally create a note from the synthesis
        const shouldSaveAsNote = confirm(`Save synthesis of "${scrapedContent.title}" as a note?`);
        if (shouldSaveAsNote) {
          const title = prompt('Enter note title:') || scrapedContent.title;
          dispatch({
            type: 'ADD_NOTE',
            payload: {
              userId: state.user.userId,
              projectId: state.activeProject,
              title,
              content: result,
              sourceUrl: inputUrl,
              tags: ['ai-synthesis', 'web-content'],
              createdAt: new Date().toISOString(),
            }
          });
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size limits
    const canUpload = BusinessLogicService.canUploadFile(state.user, file.size);
    if (!canUpload.allowed) {
      setError(canUpload.message);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const extractedContent = await extractTextFromFile(file);
      setInputText(extractedContent.content);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSynthesize = async () => {
    if (!inputText.trim()) {
      setError('Please provide text to analyze');
      return;
    }

    // Check business logic permissions
    const canSynthesize = BusinessLogicService.canUseSynthesis(state.user);
    if (!canSynthesize.allowed) {
      setError(canSynthesize.message);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await synthesizeText(inputText, customPrompt);
      
      // Record usage
      BusinessLogicService.recordUsage(state.user, 'synthesis');
      
      // Save synthesis result
      const synthesisId = Date.now().toString();
      dispatch({
        type: 'SET_SYNTHESIS_RESULT',
        payload: {
          id: synthesisId,
          result: {
            originalText: inputText,
            summary: result,
            prompt: customPrompt,
            createdAt: new Date().toISOString(),
          }
        }
      });

      // Optionally create a note from the synthesis
      const shouldSaveAsNote = confirm('Save this synthesis as a note?');
      if (shouldSaveAsNote) {
        const title = prompt('Enter note title:') || `AI Synthesis - ${new Date().toLocaleDateString()}`;
        dispatch({
          type: 'ADD_NOTE',
          payload: {
            userId: state.user.userId,
            projectId: state.activeProject,
            title,
            content: result,
            sourceUrl: uploadType === 'url' ? inputUrl : '',
            tags: ['ai-synthesis'],
            createdAt: new Date().toISOString(),
          }
        });
      }

      // Clear form
      setInputText('');
      setInputUrl('');
      setCustomPrompt('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Upload Type Selector */}
      <div className="flex space-x-1 bg-bg rounded-lg p-1">
        <button
          onClick={() => setUploadType('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadType === 'text'
              ? 'bg-surface text-textPrimary shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text</span>
        </button>
        
        <button
          onClick={() => setUploadType('file')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadType === 'file'
              ? 'bg-surface text-textPrimary shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>File</span>
        </button>
        
        <button
          onClick={() => setUploadType('url')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadType === 'url'
              ? 'bg-surface text-textPrimary shadow-sm'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>URL</span>
        </button>
      </div>

      {/* Content Input */}
      {uploadType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Paste your text for analysis
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your document, article, or any text here for AI synthesis..."
            className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>
      )}

      {uploadType === 'file' && (
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Upload a text file
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-textSecondary mx-auto mb-4" />
            <input
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Choose File
            </label>
            <p className="text-sm text-textSecondary mt-2">
              Supports TXT, MD, DOC files
            </p>
          </div>
        </div>
      )}

      {uploadType === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Enter URL to analyze
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <button
                onClick={handleUrlScraping}
                disabled={isProcessing}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Scraping...' : 'Scrape & Analyze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-textPrimary mb-2">
          Custom Analysis Prompt (Optional)
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g., Focus on key methodologies and findings..."
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Synthesize Button */}
      <button
        onClick={handleSynthesize}
        disabled={isProcessing || !inputText.trim()}
        className="w-full flex items-center justify-center space-x-2 p-4 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing with AI...</span>
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            <span>Synthesize with AI</span>
          </>
        )}
      </button>
    </div>
  );
}
