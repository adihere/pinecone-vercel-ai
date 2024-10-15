import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Implement your validation logic here
  // This is a placeholder implementation
  const isValid = text.length > 10;
  const result = isValid ? 'Text is valid.' : 'Text is too short. It should be more than 10 characters.';

  return NextResponse.json({ result });
}
