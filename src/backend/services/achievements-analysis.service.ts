/**
 * Achievements Analysis Service
 * Extracts and analyzes key achievements from CV data
 */

import { ParsedCV } from '../types/enhanced-models';
import OpenAI from 'openai';
import { config } from '../config/environment';

interface Achievement {
  title: string;
  description: string;
  impact: string;
  company: string;
  timeframe: string;
  category: 'leadership' | 'technical' | 'business' | 'innovation' | 'team' | 'project';
  metrics?: string[];
  significance: number; // 1-10 scale
}

export class AchievementsAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY || ''
    });
  }

  /**
   * Extract key achievements from parsed CV data
   */
  async extractKeyAchievements(cv: ParsedCV): Promise<Achievement[]> {
    const achievements: Achievement[] = [];

    try {
      // Extract from work experience
      if (cv.experience && cv.experience.length > 0) {
        for (const job of cv.experience) {
          try {
            const jobAchievements = await this.extractFromExperience(job);
            achievements.push(...jobAchievements);
          } catch (error) {
            // Continue with next job rather than failing completely
          }
        }
      }

      // Extract from description/summary
      if (cv.personalInfo?.summary) {
        try {
          const summaryAchievements = await this.extractFromSummary(cv.personalInfo.summary);
          achievements.push(...summaryAchievements);
        } catch (error) {
          // Continue with existing achievements
        }
      }

      // Sort by significance and return top achievements
      const sortedAchievements = achievements
        .filter(achievement => achievement && achievement.title) // Filter out invalid achievements
        .sort((a, b) => b.significance - a.significance)
        .slice(0, 5); // Return top 5 achievements

      return sortedAchievements;

    } catch (error) {
      // Return empty array rather than throwing to allow graceful degradation
      return [];
    }
  }

  /**
   * Extract achievements from a single work experience
   */
  private async extractFromExperience(experience: any): Promise<Achievement[]> {
    if (!this.openai.apiKey) {
      return this.fallbackExperienceExtraction(experience);
    }

    try {
      const prompt = `
IMPORTANT: You MUST respond with valid JSON only. Do not include any explanatory text or markdown formatting.

Analyze this work experience and extract specific, quantifiable achievements. Focus on REAL accomplishments with measurable impact.

Position: ${experience.position}
Company: ${experience.company}
Duration: ${experience.duration || experience.startDate + ' - ' + (experience.endDate || 'Present')}
Description: ${experience.description || ''}
Achievements: ${experience.achievements?.join(', ') || 'None listed'}

Extract achievements that show:
1. Leadership impact
2. Technical innovation
3. Business results
4. Team development
5. Process improvements

REQUIRED JSON FORMAT (no additional text):
{
  "achievements": [
    {
      "title": "Brief achievement title",
      "description": "Detailed description of what was accomplished",
      "impact": "Specific impact or benefit delivered",
      "metrics": ["quantifiable results if any"],
      "category": "leadership",
      "significance": 8
    }
  ]
}

Category must be one of: leadership, technical, business, innovation, team, project
Significance must be a number from 1-10
Only include real, substantive achievements. Skip generic responsibilities.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const responseContent = response.choices[0].message.content || '';
      const result = this.parseAIResponse(responseContent, 'experience extraction');
      
      if (!result || !Array.isArray(result.achievements)) {
        return this.fallbackExperienceExtraction(experience);
      }
      
      // Validate and clean each achievement
      const validAchievements = result.achievements
        .map((ach: any) => this.validateAndCleanAchievement(ach))
        .filter((ach: Achievement | null) => ach !== null)
        .map((ach: any) => ({
          ...ach,
          company: experience.company,
          timeframe: experience.duration || `${experience.startDate} - ${experience.endDate || 'Present'}`
        }));

      return validAchievements;

    } catch (error) {
      return this.fallbackExperienceExtraction(experience);
    }
  }

  /**
   * Extract achievements from summary/description
   */
  private async extractFromSummary(summary: string): Promise<Achievement[]> {
    if (!this.openai.apiKey) {
      return [];
    }

    try {
      const prompt = `
IMPORTANT: You MUST respond with valid JSON only. Do not include any explanatory text or markdown formatting.

Analyze this professional summary and extract key career achievements:

Summary: ${summary}

Extract high-level achievements that demonstrate:
- Career progression
- Leadership experience  
- Technical expertise
- Industry impact
- Notable accomplishments

REQUIRED JSON FORMAT (no additional text):
{
  "achievements": [
    {
      "title": "Achievement title",
      "description": "What was accomplished", 
      "impact": "The result or benefit",
      "category": "leadership",
      "significance": 7
    }
  ]
}

Category must be one of: leadership, technical, business, innovation, team, project
Significance must be a number from 1-10
Focus on concrete achievements, not generic statements.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      });

      const responseContent = response.choices[0].message.content || '';
      const result = this.parseAIResponse(responseContent, 'summary extraction');
      
      if (!result || !Array.isArray(result.achievements)) {
        return [];
      }
      
      // Validate and clean each achievement
      const validAchievements = result.achievements
        .map((ach: any) => this.validateAndCleanAchievement(ach))
        .filter((ach: Achievement | null) => ach !== null)
        .map((ach: any) => ({
          ...ach,
          company: 'Career Overview',
          timeframe: 'Career span'
        }));

      return validAchievements;

    } catch (error) {
      return [];
    }
  }

  /**
   * Validate and clean an achievement object
   */
  private validateAndCleanAchievement(ach: any): Achievement | null {
    if (!ach || typeof ach !== 'object') {
      return null;
    }

    // Required fields validation
    if (!ach.title || typeof ach.title !== 'string') {
      return null;
    }

    if (!ach.description || typeof ach.description !== 'string') {
      return null;
    }

    // Validate category
    const validCategories: Achievement['category'][] = ['leadership', 'technical', 'business', 'innovation', 'team', 'project'];
    const category = validCategories.includes(ach.category) ? ach.category : 'project';

    // Validate significance
    let significance = parseInt(ach.significance) || 5;
    significance = Math.max(1, Math.min(10, significance));

    // Clean and validate fields
    return {
      title: ach.title.trim().substring(0, 100), // Limit title length
      description: ach.description.trim().substring(0, 500), // Limit description length
      impact: (ach.impact || 'Contributed to organizational objectives').trim().substring(0, 300),
      company: ach.company || 'Unknown Company',
      timeframe: ach.timeframe || 'Not specified',
      category,
      metrics: Array.isArray(ach.metrics) ? ach.metrics.filter(m => typeof m === 'string') : [],
      significance
    };
  }

  /**
   * Safely parse AI response with proper error handling and validation
   */
  private parseAIResponse(responseContent: string, context: string): any {
    if (!responseContent || typeof responseContent !== 'string') {
      return null;
    }

    // Clean the response content - remove any markdown formatting
    let cleanContent = responseContent.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Handle malformed responses that start with text before JSON
    // Look for common AI response patterns like "The provided..." or "Based on..."
    if (cleanContent.match(/^(The provided|Based on|Here is|Here are|I'll analyze)/i)) {
      // Try to find JSON pattern in the text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      } else {
        return null;
      }
    }

    // Try to extract JSON from text if the response is not pure JSON
    if (!cleanContent.startsWith('{') && !cleanContent.startsWith('[')) {
      // Look for JSON pattern in the text with more flexible matching
      const jsonPatterns = [
        /\{[\s\S]*?\}/g,  // Multiple JSON objects
        /\[[\s\S]*?\]/g,  // JSON arrays
        /\{[^}]*"achievements"[^}]*\}/g  // JSON with achievements key
      ];
      
      let found = false;
      for (const pattern of jsonPatterns) {
        const matches = cleanContent.match(pattern);
        if (matches && matches.length > 0) {
          // Use the longest match which is likely the most complete
          cleanContent = matches.reduce((longest, current) => 
            current.length > longest.length ? current : longest
          );
          found = true;
          break;
        }
      }
      
      if (!found) {
        return null;
      }
    }

    // Additional cleaning for common JSON issues
    cleanContent = cleanContent
      .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
      .replace(/\n/g, ' ')     // Replace newlines with spaces
      .replace(/\s+/g, ' ');   // Normalize whitespace

    try {
      const parsed = JSON.parse(cleanContent);
      
      // Validate the structure
      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }

      // Ensure achievements array exists
      if (!parsed.achievements) {
        parsed.achievements = [];
      }

      // Validate achievements array structure
      if (!Array.isArray(parsed.achievements)) {
        parsed.achievements = [];
      }

      return parsed;
    } catch (parseError) {
      console.error(`JSON parsing failed for ${context}:`, {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        contentStart: cleanContent.substring(0, 200),
        originalStart: responseContent.substring(0, 200)
      });
      
      // Try one more time with more aggressive cleaning
      try {
        // Remove any non-JSON characters at the beginning and end
        const jsonStartIndex = cleanContent.indexOf('{');
        const jsonEndIndex = cleanContent.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
          const finalAttempt = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1);
          const lastAttemptParsed = JSON.parse(finalAttempt);
          
          if (!lastAttemptParsed.achievements) {
            lastAttemptParsed.achievements = [];
          }
          
          return lastAttemptParsed;
        }
      } catch (finalError) {
      }
      
      return null;
    }
  }

  /**
   * Fallback extraction when OpenAI is not available
   */
  private fallbackExperienceExtraction(experience: any): Achievement[] {
    const achievements: Achievement[] = [];

    if (experience.achievements && experience.achievements.length > 0) {
      experience.achievements.forEach((achievement: string, index: number) => {
        achievements.push({
          title: `Key Achievement ${index + 1}`,
          description: achievement,
          impact: 'Contributed to team and organizational success',
          company: experience.company,
          timeframe: experience.duration || `${experience.startDate} - ${experience.endDate || 'Present'}`,
          category: this.categorizeAchievement(achievement),
          significance: this.calculateSignificance(achievement)
        });
      });
    }

    return achievements;
  }

  /**
   * Categorize achievement based on keywords
   */
  private categorizeAchievement(text: string): Achievement['category'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('lead') || lowerText.includes('manage') || lowerText.includes('direct')) {
      return 'leadership';
    }
    if (lowerText.includes('develop') || lowerText.includes('architect') || lowerText.includes('implement')) {
      return 'technical';
    }
    if (lowerText.includes('revenue') || lowerText.includes('cost') || lowerText.includes('efficiency')) {
      return 'business';
    }
    if (lowerText.includes('innovat') || lowerText.includes('new') || lowerText.includes('first')) {
      return 'innovation';
    }
    if (lowerText.includes('team') || lowerText.includes('mentor') || lowerText.includes('hire')) {
      return 'team';
    }
    
    return 'project';
  }

  /**
   * Calculate significance based on achievement content
   */
  private calculateSignificance(text: string): number {
    let score = 5; // Base score
    
    const lowerText = text.toLowerCase();
    
    // Boost for quantifiable metrics
    if (/\d+%|\$\d+|\d+x|million|billion/.test(lowerText)) score += 2;
    
    // Boost for leadership terms
    if (/lead|manage|direct|head|vp|director/.test(lowerText)) score += 1;
    
    // Boost for impact terms
    if (/improve|increase|reduce|save|deliver|launch/.test(lowerText)) score += 1;
    
    // Boost for scale terms  
    if (/enterprise|global|organization|company-wide/.test(lowerText)) score += 1;
    
    return Math.min(10, score);
  }

  /**
   * Generate achievement display HTML
   */
  generateAchievementsHTML(achievements: Achievement[]): string {
    if (!achievements.length) {
      return '<p>No key achievements extracted from CV data.</p>';
    }

    return `
      <div class="key-achievements">
        ${achievements.map(achievement => `
          <div class="achievement-item">
            <div class="achievement-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L20 12H30L22 18L26 28L16 22L6 28L10 18L2 12H12L16 2Z" fill="#FFD700"/>
              </svg>
            </div>
            <div class="achievement-content">
              <h4 class="achievement-title">${achievement.title}</h4>
              <p class="achievement-description">${achievement.description}</p>
              <div class="achievement-meta">
                <span class="achievement-company">${achievement.company}</span>
                <span class="achievement-timeframe">${achievement.timeframe}</span>
                <span class="achievement-category">${achievement.category.toUpperCase()}</span>
              </div>
              ${achievement.impact ? `<p class="achievement-impact"><strong>Impact:</strong> ${achievement.impact}</p>` : ''}
              ${achievement.metrics && achievement.metrics.length > 0 ? 
                `<div class="achievement-metrics">
                  ${achievement.metrics.map(metric => `<span class="metric-badge">${metric}</span>`).join('')}
                </div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      <style>
        .key-achievements {
          margin: 20px 0;
        }
        .achievement-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 15px;
          border-left: 4px solid #2563eb;
          background: #f8fafc;
          border-radius: 8px;
        }
        .achievement-icon {
          margin-right: 15px;
          flex-shrink: 0;
        }
        .achievement-content {
          flex: 1;
        }
        .achievement-title {
          margin: 0 0 8px 0;
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
        }
        .achievement-description {
          margin: 0 0 10px 0;
          color: #374151;
          line-height: 1.5;
        }
        .achievement-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .achievement-company,
        .achievement-timeframe,
        .achievement-category {
          font-size: 12px;
          color: #6b7280;
          background: #e5e7eb;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .achievement-category {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .achievement-impact {
          margin: 8px 0;
          color: #059669;
          font-size: 14px;
        }
        .achievement-metrics {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .metric-badge {
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }
      </style>
    `;
  }
}