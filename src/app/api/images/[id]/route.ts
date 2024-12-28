import { NextResponse } from 'next/server';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const client = new MongoClient(uri);

  try {
    // Await the params
    const { id: imageId } = await Promise.resolve(context.params);

    await client.connect();
    const db = client.db("codecraft");
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    const id = new ObjectId(imageId);
    const file = await bucket.find({ _id: id }).next();

    if (!file) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(id);

    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
  } finally {
    await client.close();
  }
} 