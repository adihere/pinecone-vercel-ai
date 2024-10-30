//import { NextRequest, NextResponse } from 'next/server';
import { generateText, Message } from 'ai';
import { getContext } from '../../utils/context';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const DEBUG = true; // Set this flag to true to enable debug logging

function textToJSON(text: string) {
  return { text: text };
}

function debugLog(message: string, data: any = null) {
  if (DEBUG) {
    console.log(message);
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
    // Add file logging logic here if needed
  }
}

export async function POST(req: Request) {
  try {
    const { text: inputText } = await req.json();
    debugLog("message from route ts - INPUT", inputText);

    let messageString: string;
    // Ensure message is a string
    messageString = typeof inputText === 'string' ? inputText : JSON.stringify(inputText);

    // Get the context from the last message
    const contextADRFromVector = await getContext(messageString, '');
    debugLog("message from route ts - CONTEXT", contextADRFromVector);

    const ADRprompt = [
      {
        role: 'system',
        content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${messageString}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
      },
    ];
    const systemPre = "You are an expert enterprise architect with deep knowledge of Architecture Decision Records and its validation. You will be given a context block followed by ADR text and you will need to validate the ADR based on the context block. Provide structural feedback in bullet points and sub-headings. List down the Positive points first followed by Areas of Improvement START OF CONTEXT ";
    const systemPost = "END OF CONTEXT.  Do not return special characters or markdown formatting.  Just return the text ";

    const { text: generatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: systemPre + contextADRFromVector + messageString + systemPost,
    });
    debugLog("message from route ts - RESPONSE", generatedText);
    debugLog("message from route ts - PROMPT", "PRE \n" + systemPre + "contextADRFromVector" + contextADRFromVector + "messageString" + messageString + systemPost);

    return new Response(JSON.stringify(textToJSON(generatedText)), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    debugLog("Error in POST handler", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
