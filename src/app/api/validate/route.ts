import { NextRequest, NextResponse } from 'next/server';
import { Message } from 'ai'
import { getContext } from '../../utils/context'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';


// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    /*
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('400 Error: Invalid or empty messages array', { messages });
      return NextResponse.json({ error: 'Invalid or empty messages array' }, { status: 400 })
    }
    */


    // Ensure message is a string
    const messageString = typeof message === 'string' ? message : JSON.stringify(message)
    // Get the context from the message
    const context = await getContext(messageString, '')


    const prompt = [
      {
        role: 'system',
        content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
      },
    ]

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [...prompt,...message.filter((message: Message) => message.role === 'user')]
    });

    return result.toDataStreamResponse();
  } catch (e) {
    throw (e)
  }


}
