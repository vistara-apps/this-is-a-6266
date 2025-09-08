import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here', // In production, use environment variables
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export async function synthesizeText(text, prompt = '') {
  try {
    const systemPrompt = `You are an expert research assistant. Your task is to analyze and synthesize the provided text into a clear, concise summary that captures the key insights, main arguments, and important details. Focus on:

1. Main themes and concepts
2. Key findings or conclusions
3. Important data points or statistics
4. Actionable insights
5. Relevant quotes or examples

Provide a structured summary that's easy to scan and understand.`;

    const userPrompt = prompt || `Please analyze and synthesize the following text into a comprehensive summary:

${text}`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI synthesis error:', error);
    throw new Error('Failed to synthesize text. Please check your API configuration.');
  }
}

export async function prioritizeTasks(tasks, projectGoal) {
  try {
    const prompt = `Given the following project goal and tasks, please analyze and suggest the optimal priority order. Consider dependencies, deadlines, and impact on the overall goal.

Project Goal: ${projectGoal}

Tasks:
${tasks.map(task => `- ${task.description} (Due: ${task.dueDate}, Dependencies: ${task.dependencies.join(', ') || 'None'})`).join('\n')}

Please provide:
1. Recommended priority order (high/medium/low)
2. Brief reasoning for each priority assignment
3. Suggested workflow optimizations

Format your response as a JSON object with task descriptions as keys and priority levels as values.`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Task prioritization error:', error);
    throw new Error('Failed to prioritize tasks. Please try again.');
  }
}

export async function generateTaskSuggestions(projectGoal, existingTasks) {
  try {
    const prompt = `Based on the project goal and existing tasks, suggest 3-5 additional tasks that would help achieve the project objective.

Project Goal: ${projectGoal}

Existing Tasks:
${existingTasks.map(task => `- ${task.description}`).join('\n')}

Please suggest specific, actionable tasks that complement the existing ones.`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Task suggestion error:', error);
    throw new Error('Failed to generate task suggestions.');
  }
}