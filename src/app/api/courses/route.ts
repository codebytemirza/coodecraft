import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/data/courses.json');

export async function GET() {
  const data = await fs.readFile(dataPath, 'utf8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(request: Request) {
  const data = await request.json();
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}