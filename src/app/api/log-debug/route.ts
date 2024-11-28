import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const LOGS_FILE_PATH = '/tmp/debug.log';
    const { info } = await request.json();
    //const logPath = path.join(process.cwd(), 'src', 'app', 'validate', 'debug.log');
    await fs.appendFile(LOGS_FILE_PATH, `${new Date().toISOString()}: ${info}\n`);
    return NextResponse.json({ message: 'Debug info logged successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error writing to debug log:', error);
    return NextResponse.json({ error: 'Failed to log debug info' }, { status: 500 });
  }
}
