import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const assistant = {
  openai,
  anthropic,

  // Helper method to generate chat completion using GPT-4
  async generateChatCompletion(messages: any[]) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
      });
      return completion.choices[0].message;
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  },

  // Helper method to generate completion using Claude
  async generateClaudeCompletion(prompt: string) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      });
      return message.content;
    } catch (error) {
      console.error('Error generating Claude completion:', error);
      throw error;
    }
  }
};
