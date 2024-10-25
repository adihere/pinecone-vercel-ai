//import { NextRequest, NextResponse } from 'next/server';
import { generateText, Message } from 'ai'
import { getContext } from '../../utils/context'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';


// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { text: inputText } = await req.json()    
    console.log("message from route ts", inputText);    
    
    /*
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('400 Error: Invalid or empty messages array', { messages });
      return NextResponse.json({ error: 'Invalid or empty messages array' }, { status: 400 })
    }
    */


    let messageString: string;
    // Ensure message is a string
    messageString = typeof inputText === 'string' ? inputText : JSON.stringify(inputText);  
    // debug
    //const tempMessageDebug = "ADR 001: Replace RabbitMQ with Kafka Context: Currently, our messaging system uses RabbitMQ for queue management. While RabbitMQ has served us well, we have encountered several issues with scalability, throughput, and maintenance complexity. With increasing demand for real-time data processing and larger message volumes, an alternative solution is needed. Decision: We will replace RabbitMQ with Apache Kafka as our primary message queue system. Rationale: Scalability: Kafka's partitioned log model allows for horizontal scaling with ease, handling higher loads without significant performance drops. Throughput: Kafka's architecture supports higher message throughput, making it more suitable for our growing data volume and real-time processing needs. Durability: Kafka's replicated logs ensure data is durable and fault-tolerant, reducing the risk of data loss. Consequences:Migration Effort: Transitioning to Kafka will require significant changes to our messaging system, including updates to message producers, consumers, and monitoring systems. Infrastructure Costs: Initial setup and operation of Kafka clusters could increase infrastructure costs due to resource requirements. Status: Approved Date: 15 October 2024";
    ///end of debug

    // Get the context from the message    
    //const context = await getContext(messageString, '')


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
    ]

    const systemPre = "You are an expert ADR validator. You will be given a context block and you will need to validate the ADR based on the context block. Provide structural feedback in bullet points and sub-headings. START OF CONTEXT ";
    
    const { text: generatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: systemPre + messageString + "END OF CONTEXT ",
    });


    return new Response(generatedText);
  } catch (e) {
    throw (e)
  }

}
