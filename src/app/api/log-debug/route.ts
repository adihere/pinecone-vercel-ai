import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { info } = await request.json();
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${info}`);
    return NextResponse.json({ message: 'Debug info logged successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error logging debug info:', error);
    return NextResponse.json({ error: 'Failed to log debug info' }, { status: 500 });
  }
}