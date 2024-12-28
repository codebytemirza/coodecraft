import { NextResponse } from 'next/server';
import { MongoClient, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

export async function POST(request: Request) {
  const client = new MongoClient(uri);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    await client.connect();
    const db = client.db("codecraft");
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a readable stream from the buffer
    const stream = Readable.from(buffer);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type
    });

    await new Promise((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const imageUrl = `/api/images/${uploadStream.id}`;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}