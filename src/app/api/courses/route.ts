import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const config = {
  uri: "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site",
  dbName: "codecraft",
  connection: {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
};

interface Batch {
  startDate: Date;
  endDate: Date;
  seats: number;
  enrolledStudents: number;
  status: string;
  batchCode: string;
}

interface Course {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;
  level: string;
  batches?: Batch[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// MongoDB Client Helper
const getClient = async () => {
  const client = new MongoClient(config.uri, config.connection);
  await client.connect();
  return client;
};

// GET All Courses
export async function GET(req: NextRequest): Promise<NextResponse> {
  const client = await getClient();
  try {
    const db = client.db(config.dbName);
    const courses = await db.collection<Course>("courses").find().sort({ createdAt: -1 }).toArray();

    const processedCourses = courses.map(course => ({
      ...course,
      _id: course._id?.toString(),
      batches: course.batches?.map(batch => ({
        ...batch,
        startDate: batch.startDate.toISOString(),
        endDate: batch.endDate.toISOString(),
      })),
    }));

    return NextResponse.json(processedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  } finally {
    await client.close();
  }
}
