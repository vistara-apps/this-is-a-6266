/**
 * Business Logic Service for InsightSynth
 * Handles subscription management, feature access, and business rules
 */

// Subscription tier definitions
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team'
};

// Feature limits by subscription tier
export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxProjects: 3,
    maxNotesPerProject: 50,
    maxTasksPerProject: 25,
    aiSynthesisPerMonth: 10,
    webScrapingPerMonth: 5,
    taskPrioritizationPerMonth: 5,
    maxFileUploadSize: 5 * 1024 * 1024, // 5MB
    collaborators: 0,
    exportFormats: ['txt'],
    features: {
      basicSynthesis: true,
      advancedSynthesis: false,
      webScraping: true,
      taskPrioritization: true,
      focusMode: true,
      collaboration: false,
      apiAccess: false,
      prioritySupport: false,
      customPrompts: false,
      batchProcessing: false
    }
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    maxProjects: 25,
    maxNotesPerProject: -1, // Unlimited
    maxTasksPerProject: -1, // Unlimited
    aiSynthesisPerMonth: 1000,
    webScrapingPerMonth: 500,
    taskPrioritizationPerMonth: 500,
    maxFileUploadSize: 50 * 1024 * 1024, // 50MB
    collaborators: 5,
    exportFormats: ['txt', 'md', 'pdf', 'docx'],
    features: {
      basicSynthesis: true,
      advancedSynthesis: true,
      webScraping: true,
      taskPrioritization: true,
      focusMode: true,
      collaboration: true,
      apiAccess: true,
      prioritySupport: false,
      customPrompts: true,
      batchProcessing: true
    }
  },
  [SUBSCRIPTION_TIERS.TEAM]: {
    maxProjects: -1, // Unlimited
    maxNotesPerProject: -1, // Unlimited
    maxTasksPerProject: -1, // Unlimited
    aiSynthesisPerMonth: 5000,
    webScrapingPerMonth: 2000,
    taskPrioritizationPerMonth: 2000,
    maxFileUploadSize: 100 * 1024 * 1024, // 100MB
    collaborators: -1, // Unlimited
    exportFormats: ['txt', 'md', 'pdf', 'docx', 'json'],
    features: {
      basicSynthesis: true,
      advancedSynthesis: true,
      webScraping: true,
      taskPrioritization: true,
      focusMode: true,
      collaboration: true,
      apiAccess: true,
      prioritySupport: true,
      customPrompts: true,
      batchProcessing: true
    }
  }
};

// Usage tracking for rate limiting
class UsageTracker {
  constructor() {
    this.usage = new Map();
  }

  getUsageKey(userId, feature, period = 'month') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return `${userId}:${feature}:${period}:${year}-${month}`;
  }

  incrementUsage(userId, feature, amount = 1) {
    const key = this.getUsageKey(userId, feature);
    const current = this.usage.get(key) || 0;
    this.usage.set(key, current + amount);
    
    // In production, this would be stored in Redis or database
    localStorage.setItem(`usage:${key}`, (current + amount).toString());
  }

  getUsage(userId, feature) {
    const key = this.getUsageKey(userId, feature);
    
    // Try to get from memory first, then localStorage
    if (this.usage.has(key)) {
      return this.usage.get(key);
    }
    
    const stored = localStorage.getItem(`usage:${key}`);
    const usage = stored ? parseInt(stored, 10) : 0;
    this.usage.set(key, usage);
    return usage;
  }

  resetUsage(userId, feature) {
    const key = this.getUsageKey(userId, feature);
    this.usage.set(key, 0);
    localStorage.removeItem(`usage:${key}`);
  }
}

export const usageTracker = new UsageTracker();

// Business logic functions
export class BusinessLogicService {
  static canCreateProject(user, currentProjectCount) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    if (limits.maxProjects === -1) return { allowed: true };
    
    return {
      allowed: currentProjectCount < limits.maxProjects,
      limit: limits.maxProjects,
      current: currentProjectCount,
      message: currentProjectCount >= limits.maxProjects 
        ? `You've reached the maximum of ${limits.maxProjects} projects for your ${user.subscriptionTier} plan.`
        : null
    };
  }

  static canCreateNote(user, projectNoteCount) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    if (limits.maxNotesPerProject === -1) return { allowed: true };
    
    return {
      allowed: projectNoteCount < limits.maxNotesPerProject,
      limit: limits.maxNotesPerProject,
      current: projectNoteCount,
      message: projectNoteCount >= limits.maxNotesPerProject
        ? `You've reached the maximum of ${limits.maxNotesPerProject} notes per project for your ${user.subscriptionTier} plan.`
        : null
    };
  }

  static canCreateTask(user, projectTaskCount) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    if (limits.maxTasksPerProject === -1) return { allowed: true };
    
    return {
      allowed: projectTaskCount < limits.maxTasksPerProject,
      limit: limits.maxTasksPerProject,
      current: projectTaskCount,
      message: projectTaskCount >= limits.maxTasksPerProject
        ? `You've reached the maximum of ${limits.maxTasksPerProject} tasks per project for your ${user.subscriptionTier} plan.`
        : null
    };
  }

  static canUseSynthesis(user) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    const currentUsage = usageTracker.getUsage(user.userId, 'synthesis');
    
    return {
      allowed: currentUsage < limits.aiSynthesisPerMonth,
      limit: limits.aiSynthesisPerMonth,
      current: currentUsage,
      remaining: limits.aiSynthesisPerMonth - currentUsage,
      message: currentUsage >= limits.aiSynthesisPerMonth
        ? `You've reached your monthly limit of ${limits.aiSynthesisPerMonth} AI synthesis requests.`
        : null
    };
  }

  static canUseWebScraping(user) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    const currentUsage = usageTracker.getUsage(user.userId, 'webScraping');
    
    return {
      allowed: currentUsage < limits.webScrapingPerMonth,
      limit: limits.webScrapingPerMonth,
      current: currentUsage,
      remaining: limits.webScrapingPerMonth - currentUsage,
      message: currentUsage >= limits.webScrapingPerMonth
        ? `You've reached your monthly limit of ${limits.webScrapingPerMonth} web scraping requests.`
        : null
    };
  }

  static canUseTaskPrioritization(user) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    const currentUsage = usageTracker.getUsage(user.userId, 'taskPrioritization');
    
    return {
      allowed: currentUsage < limits.taskPrioritizationPerMonth,
      limit: limits.taskPrioritizationPerMonth,
      current: currentUsage,
      remaining: limits.taskPrioritizationPerMonth - currentUsage,
      message: currentUsage >= limits.taskPrioritizationPerMonth
        ? `You've reached your monthly limit of ${limits.taskPrioritizationPerMonth} task prioritization requests.`
        : null
    };
  }

  static canUploadFile(user, fileSize) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    
    return {
      allowed: fileSize <= limits.maxFileUploadSize,
      limit: limits.maxFileUploadSize,
      current: fileSize,
      message: fileSize > limits.maxFileUploadSize
        ? `File size exceeds the ${this.formatFileSize(limits.maxFileUploadSize)} limit for your ${user.subscriptionTier} plan.`
        : null
    };
  }

  static hasFeature(user, featureName) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    return limits.features[featureName] || false;
  }

  static getAvailableExportFormats(user) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    return limits.exportFormats;
  }

  static getUsageSummary(user) {
    const limits = TIER_LIMITS[user.subscriptionTier];
    
    return {
      tier: user.subscriptionTier,
      synthesis: {
        used: usageTracker.getUsage(user.userId, 'synthesis'),
        limit: limits.aiSynthesisPerMonth,
        remaining: limits.aiSynthesisPerMonth - usageTracker.getUsage(user.userId, 'synthesis')
      },
      webScraping: {
        used: usageTracker.getUsage(user.userId, 'webScraping'),
        limit: limits.webScrapingPerMonth,
        remaining: limits.webScrapingPerMonth - usageTracker.getUsage(user.userId, 'webScraping')
      },
      taskPrioritization: {
        used: usageTracker.getUsage(user.userId, 'taskPrioritization'),
        limit: limits.taskPrioritizationPerMonth,
        remaining: limits.taskPrioritizationPerMonth - usageTracker.getUsage(user.userId, 'taskPrioritization')
      },
      features: limits.features,
      limits: {
        maxProjects: limits.maxProjects,
        maxNotesPerProject: limits.maxNotesPerProject,
        maxTasksPerProject: limits.maxTasksPerProject,
        maxFileUploadSize: limits.maxFileUploadSize,
        collaborators: limits.collaborators
      }
    };
  }

  static recordUsage(user, feature, amount = 1) {
    usageTracker.incrementUsage(user.userId, feature, amount);
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getUpgradeRecommendation(user, requestedFeature) {
    if (user.subscriptionTier === SUBSCRIPTION_TIERS.TEAM) {
      return null; // Already on highest tier
    }

    const currentLimits = TIER_LIMITS[user.subscriptionTier];
    const nextTier = user.subscriptionTier === SUBSCRIPTION_TIERS.FREE 
      ? SUBSCRIPTION_TIERS.PRO 
      : SUBSCRIPTION_TIERS.TEAM;
    const nextLimits = TIER_LIMITS[nextTier];

    const benefits = [];
    
    // Compare limits and features
    if (nextLimits.aiSynthesisPerMonth > currentLimits.aiSynthesisPerMonth) {
      benefits.push(`${nextLimits.aiSynthesisPerMonth} AI synthesis requests/month`);
    }
    
    if (nextLimits.maxProjects > currentLimits.maxProjects || nextLimits.maxProjects === -1) {
      benefits.push(nextLimits.maxProjects === -1 ? 'Unlimited projects' : `${nextLimits.maxProjects} projects`);
    }

    // Check for new features
    Object.keys(nextLimits.features).forEach(feature => {
      if (nextLimits.features[feature] && !currentLimits.features[feature]) {
        benefits.push(feature.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    });

    return {
      recommendedTier: nextTier,
      benefits,
      reason: requestedFeature ? `To use ${requestedFeature}` : 'For enhanced productivity'
    };
  }

  static validateProjectData(projectData) {
    const errors = [];
    
    if (!projectData.name || projectData.name.trim().length === 0) {
      errors.push('Project name is required');
    }
    
    if (projectData.name && projectData.name.length > 100) {
      errors.push('Project name must be less than 100 characters');
    }
    
    if (projectData.description && projectData.description.length > 500) {
      errors.push('Project description must be less than 500 characters');
    }
    
    if (projectData.goal && projectData.goal.length > 200) {
      errors.push('Project goal must be less than 200 characters');
    }
    
    if (projectData.dueDate) {
      const dueDate = new Date(projectData.dueDate);
      const now = new Date();
      if (dueDate < now) {
        errors.push('Due date cannot be in the past');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateNoteData(noteData) {
    const errors = [];
    
    if (!noteData.title || noteData.title.trim().length === 0) {
      errors.push('Note title is required');
    }
    
    if (noteData.title && noteData.title.length > 200) {
      errors.push('Note title must be less than 200 characters');
    }
    
    if (!noteData.content || noteData.content.trim().length === 0) {
      errors.push('Note content is required');
    }
    
    if (noteData.content && noteData.content.length > 50000) {
      errors.push('Note content must be less than 50,000 characters');
    }
    
    if (noteData.tags && noteData.tags.length > 10) {
      errors.push('Maximum 10 tags allowed per note');
    }
    
    if (noteData.sourceUrl && !this.isValidUrl(noteData.sourceUrl)) {
      errors.push('Source URL must be a valid URL');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTaskData(taskData) {
    const errors = [];
    
    if (!taskData.description || taskData.description.trim().length === 0) {
      errors.push('Task description is required');
    }
    
    if (taskData.description && taskData.description.length > 300) {
      errors.push('Task description must be less than 300 characters');
    }
    
    if (taskData.priority && !['high', 'medium', 'low'].includes(taskData.priority)) {
      errors.push('Priority must be high, medium, or low');
    }
    
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }
    
    if (taskData.dependencies && !Array.isArray(taskData.dependencies)) {
      errors.push('Dependencies must be an array');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  static calculateProductivityScore(user, projects, notes, tasks) {
    let score = 0;
    const weights = {
      projectCompletion: 30,
      taskCompletion: 25,
      noteActivity: 20,
      consistency: 15,
      aiUsage: 10
    };

    // Project completion rate
    const completedProjects = projects.filter(p => {
      const projectTasks = tasks.filter(t => t.projectId === p.projectId);
      return projectTasks.length > 0 && projectTasks.every(t => t.isCompleted);
    }).length;
    
    const projectScore = projects.length > 0 ? (completedProjects / projects.length) * weights.projectCompletion : 0;
    score += projectScore;

    // Task completion rate
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const taskScore = tasks.length > 0 ? (completedTasks / tasks.length) * weights.taskCompletion : 0;
    score += taskScore;

    // Note activity (recent notes)
    const recentNotes = notes.filter(n => {
      const noteDate = new Date(n.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return noteDate > weekAgo;
    }).length;
    
    const noteScore = Math.min(recentNotes / 5, 1) * weights.noteActivity;
    score += noteScore;

    // Consistency (activity over time)
    const consistencyScore = this.calculateConsistencyScore(notes, tasks) * weights.consistency;
    score += consistencyScore;

    // AI usage efficiency
    const synthesisUsage = usageTracker.getUsage(user.userId, 'synthesis');
    const aiScore = Math.min(synthesisUsage / 10, 1) * weights.aiUsage;
    score += aiScore;

    return Math.round(score);
  }

  static calculateConsistencyScore(notes, tasks) {
    const now = new Date();
    const daysToCheck = 7;
    let activeDays = 0;

    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(checkDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(checkDate.setHours(23, 59, 59, 999));

      const hasActivity = notes.some(n => {
        const noteDate = new Date(n.createdAt);
        return noteDate >= dayStart && noteDate <= dayEnd;
      }) || tasks.some(t => {
        const taskDate = new Date(t.updatedAt || t.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      if (hasActivity) activeDays++;
    }

    return activeDays / daysToCheck;
  }

  static getInsights(user, projects, notes, tasks) {
    const insights = [];
    const productivityScore = this.calculateProductivityScore(user, projects, notes, tasks);

    // Productivity insights
    if (productivityScore >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Productivity!',
        message: 'You\'re maintaining high productivity levels. Keep up the great work!',
        action: null
      });
    } else if (productivityScore < 50) {
      insights.push({
        type: 'warning',
        title: 'Productivity Opportunity',
        message: 'Consider breaking down large tasks and using AI synthesis to boost efficiency.',
        action: 'Try the task prioritization feature'
      });
    }

    // Task management insights
    const overdueTasks = tasks.filter(t => {
      if (t.isCompleted) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date();
    });

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'alert',
        title: `${overdueTasks.length} Overdue Tasks`,
        message: 'You have tasks that are past their due date. Consider reprioritizing.',
        action: 'Review overdue tasks'
      });
    }

    // Usage insights
    const usageSummary = this.getUsageSummary(user);
    if (usageSummary.synthesis.remaining < 3 && user.subscriptionTier === SUBSCRIPTION_TIERS.FREE) {
      insights.push({
        type: 'info',
        title: 'Low AI Credits',
        message: `You have ${usageSummary.synthesis.remaining} AI synthesis requests remaining this month.`,
        action: 'Consider upgrading to Pro'
      });
    }

    return insights;
  }
}

export default BusinessLogicService;
