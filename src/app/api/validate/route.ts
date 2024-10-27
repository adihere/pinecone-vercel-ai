//import { NextRequest, NextResponse } from 'next/server';
import { generateText, Message } from 'ai'
import { getContext } from '../../utils/context'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';


// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

function textToJSON(text: string) {
  return {
    text: text
  };
}

export async function POST(req: Request) {
  try {
    const { text: inputText } = await req.json()    
    console.log("message from route ts -INPUT", inputText);    
    
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
    const ADRInputcontext = await getContext(messageString, '')


    const systemPre = "You are an expert ADR validator. You will be given a context block and you will need to validate the ADR based on the context block. Provide structural feedback in bullet points and sub-headings. START OF CONTEXT ";
    const systemPost = "END OF CONTEXT.  Do not return special characters or markdown formatting.  Just return the text ";

    const { text: generatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: systemPre + messageString + systemPost,
    });

    console.log("message from route ts - RESPONSE", generatedText);    
    console.log("message from route ts - Context from Vector DB", ADRInputcontext );    

    return new Response(JSON.stringify(textToJSON(generatedText)), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
