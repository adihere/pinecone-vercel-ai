import fetch from 'node-fetch';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { POST } from '../validate/route';
import { NextApiHandler } from 'next';
import { NextRequest } from 'next/server';

describe('/api/validate endpoint', () => {
  const handler: NextApiHandler = (req, res) => POST(req as unknown as NextRequest);
  let server: Server;
  let url: string;

  beforeAll((done) => {
    server = createServer(handler).listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const { port } = address;
        url = `http://localhost:${port}`;
      }
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 400 for invalid input', async () => {
    const response = await fetch(`${url}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should validate valid input', async () => {
    const response = await fetch(`${url}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ content: 'Valid test message' }] }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('result');
  });

  it('should handle empty messages array', async () => {
    const response = await fetch(`${url}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Invalid or empty messages array');
  });

  it('should handle non-array messages', async () => {
    const response = await fetch(`${url}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: 'Not an array' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Invalid or empty messages array');
  });
});
