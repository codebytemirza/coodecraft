import { NextResponse } from 'next/server';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

const uri = "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site";
const dbName = "codecraft";

// MIME type mapping for common image formats
const MIME_TYPES: { [key: string]: string } = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml'
};

// Error response helper
const errorResponse = (message: string, status = 500) => {
  return NextResponse.json({ error: message }, { status });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  let client: MongoClient | null = null;

  if (!id) {
    return errorResponse('Image ID is required', 400);
  }

  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid image ID format', 400);
    }

    const objectId = new ObjectId(id);
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Get file info first to check existence and determine MIME type
    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (!files.length) {
      return errorResponse('Image not found', 404);
    }

    const file = files[0];
    const fileExtension = file.filename.split('.').pop()?.toLowerCase() || 'jpeg';
    const contentType = MIME_TYPES[fileExtension] || 'application/octet-stream';

    // Open download stream
    const downloadStream = bucket.openDownloadStream(objectId);

    // Create ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });

        downloadStream.on('end', () => {
          controller.close();
          // Note: Don't close client here as stream is still being sent
        });

        downloadStream.on('error', (err) => {
          console.error('Stream error:', err);
          controller.error(err);
          client?.close().catch(console.error);
        });
      },
      cancel() {
        // Ensure cleanup on cancel
        downloadStream.destroy();
        client?.close().catch(console.error);
      }
    });

    // Return streamed response with appropriate headers
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Accept-Ranges': 'bytes'
      },
    });
  } catch (error) {
    console.error('Error in image streaming:', error);
    // Ensure client is closed on error
    await client?.close().catch(console.error);
    return errorResponse('Failed to fetch image');
  }
  // Note: Don't close client in finally block as it would interrupt the stream
  // Cleanup is handled in stream events
}