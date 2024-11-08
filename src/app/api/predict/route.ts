// app/api/predict/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const DEBUG = true;
const MOCK_FLAG = true; // Set this flag to true to use Mockoon mock API

// Define the API endpoint based on the mock flag
const API_ENDPOINT = MOCK_FLAG ? 'http://localhost:3004/mock/predict' : '/api/predict';

function debugLog(message: string, data: any = null) {
  if (DEBUG) {
    console.log(message);
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text: inputText } = await req.json();
    debugLog("Predict Follow-up API - Input received", inputText);

    const predictPrompt = `
Given the following user message:
${inputText}

Generate 5 brief, relevant follow-up suggestions the user might want to suggest as ways to improve the ADR document better. The suggestions should be concise, open-ended, and encourage the user to refine the topic further and make it effective.`;

    // Conditionally fetch from the mock API endpoint or the actual OpenAI API
    const response = MOCK_FLAG ? 
      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      }) :
      await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: predictPrompt,
        maxTokens: 250,
        temperature: 0.7,
      });

    const predictedQuestions = await { text: response.text };

    debugLog("Predict Follow-up API - Predicted Questions", predictedQuestions);

    return new Response(JSON.stringify({ questions: predictedQuestions}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    debugLog("Error in Predict Follow-up API", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
