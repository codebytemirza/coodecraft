import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `course-${courseId}-${Date.now()}${path.extname(file.name)}`;
    const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
    
    await writeFile(imagePath, buffer);

    return NextResponse.json({ 
      imagePath: `/images/${fileName}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}