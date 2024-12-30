import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Configuration
const uri = "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site";
const dbName = "codecraft";

async function connectToDatabase() {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db(dbName);
}

// Validate course data
function validateCourse(course: any) {
    return {
        title: String(course.title || ''),
        description: String(course.description || ''),
        price: Number(course.price || 0),
        image: String(course.image || ''),
        features: Array.isArray(course.features) ? course.features.map(String) : [],
    };
}

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

export async function POST(request: Request) {
    const client = new MongoClient(uri);
    try {
        const { courses } = await request.json();
        await client.connect();
        const db = client.db(dbName);
        const coursesCollection = db.collection("courses");

        // Process each course
        const operations = courses.map(async (course: any) => {
            // Validate and clean course data
            const validatedCourse = validateCourse(course);

            if (course._id) {
                // Update existing course
                return coursesCollection.updateOne(
                    { _id: new ObjectId(course._id) },
                    {
                        $set: {
                            ...validatedCourse,
                            updatedAt: new Date()
                        }
                    }
                );
            } else {
                // Insert new course
                return coursesCollection.insertOne({
                    ...validatedCourse,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        });

        await Promise.all(operations);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating courses:', error);
        return NextResponse.json({ error: 'Failed to update courses' }, { status: 500 });
    } finally {
        await client.close();
    }
}

export async function DELETE(request: Request) {
    const client = new MongoClient(uri);
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
        }

        await client.connect();
        const db = client.db(dbName);

        const result = await db.collection("courses").deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    } finally {
        await client.close();
    }
}