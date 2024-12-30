import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Configuration
const uri = "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site";
const dbName = "codecraft";

export async function GET() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const courses = await db.collection("courses").find().toArray();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  } finally {
    await client.close();
  }
}
