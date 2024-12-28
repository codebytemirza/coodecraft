import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

export async function GET() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("codecraft");
    const courses = await db.collection("courses")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  const client = new MongoClient(uri);
  
  try {
    const courseData = await request.json();
    await client.connect();
    const db = client.db("codecraft");
    
    // Prepare the course document with all required fields
    const courseWithDefaults = {
      ...courseData,
      enrollmentCount: 0,
      rating: {
        average: 0,
        count: 0
      },
      categories: courseData.categories || [],
      requirements: courseData.requirements || [],
      language: courseData.language || "English",
      certificate: courseData.certificate !== false,
      isActive: courseData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("courses").insertOne(courseWithDefaults);
    
    // Fetch the inserted document
    const insertedCourse = await db.collection("courses").findOne({
      _id: result.insertedId
    });

    return NextResponse.json(insertedCourse);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to add course', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}