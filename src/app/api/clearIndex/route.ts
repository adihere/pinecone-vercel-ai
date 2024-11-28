import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone';

function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${message}`, data ? JSON.stringify(data) : '');
}

export async function POST() {
  try {
    debugLog("Pinecone deleteAll API - Started");

    // Instantiate a new Pinecone client
    const pinecone = new Pinecone();
    debugLog("Pinecone client instantiated");

    // Select the desired index
    const indexName = process.env.PINECONE_INDEX;
    if (!indexName) {
      throw new Error("PINECONE_INDEX environment variable is not set");
    }
    const index = pinecone.Index(indexName);
    debugLog("Pinecone index selected", { indexName });

    // Use the custom namespace, if provided, otherwise use the default
    const namespaceName = process.env.PINECONE_NAMESPACE ?? '';
    const namespace = index.namespace(namespaceName);
    debugLog("Namespace selected", { namespaceName });

    // Delete everything within the namespace
    await namespace.deleteAll();
    debugLog("Deletion completed successfully");

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    debugLog("Error in Pinecone deleteAll API", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}