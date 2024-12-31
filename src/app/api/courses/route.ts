import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Configuration
const uri = "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site";
const dbName = "codecraft";

// Type definitions
type BatchStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface Batch {
    startDate: Date;
    endDate: Date;
    seats: number;
    enrolledStudents: number;
    status: BatchStatus;
    batchCode: string;
}

// Separate interface for input batch data
interface BatchInput {
    startDate: string | Date;
    endDate: string | Date;
    seats?: number;
    enrolledStudents?: number;
    status?: BatchStatus;
    batchCode?: string;
}

interface Course {
    _id?: ObjectId;
    title: string;
    description: string;
    price: number;
    image: string;
    imageId?: string;
    features: string[];
    batches: Batch[];
    duration: string;
    level: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CourseInput extends Omit<Course, '_id' | 'batches'> {
    _id?: string;
    batches?: BatchInput[];
}

async function connectToDatabase() {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db(dbName);
}

// Updated batch validation function
function validateBatch(batch: BatchInput): Batch {
    if (!batch.startDate || !batch.endDate) {
        throw new Error('Start date and end date are required for batches');
    }

    return {
        startDate: batch.startDate instanceof Date ? batch.startDate : new Date(batch.startDate),
        endDate: batch.endDate instanceof Date ? batch.endDate : new Date(batch.endDate),
        seats: Number(batch.seats) || 30,
        enrolledStudents: Number(batch.enrolledStudents) || 0,
        status: batch.status || 'upcoming',
        batchCode: batch.batchCode || `${Math.random().toString(36).substring(7).toUpperCase()}`
    };
}

// Validate course data
function validateCourse(course: CourseInput): Partial<Course> {
    const validatedCourse: Partial<Course> = {
        title: String(course.title || ''),
        description: String(course.description || ''),
        price: Number(course.price || 0),
        image: String(course.image || ''),
        imageId: course.imageId,
        features: Array.isArray(course.features) ? course.features.map(String) : [],
        duration: String(course.duration || ''),
        level: String(course.level || ''),
    };

    if (course.batches) {
        if (!Array.isArray(course.batches)) {
            throw new Error('Batches must be an array');
        }
        validatedCourse.batches = course.batches.map(validateBatch);
    }

    return validatedCourse;
}

export async function GET() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const courses = await db.collection<Course>("courses")
            .find()
            .sort({ 'batches.startDate': 1 })
            .toArray();
        
        // Transform dates to ISO strings for JSON serialization
        const processedCourses = courses.map(course => ({
            ...course,
            _id: course._id.toString(),
            batches: course.batches?.map(batch => ({
                ...batch,
                startDate: batch.startDate.toISOString(),
                endDate: batch.endDate.toISOString()
            }))
        }));

        return NextResponse.json(processedCourses);
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
        const { courses } = await request.json() as { courses: CourseInput[] };
        await client.connect();
        const db = client.db(dbName);
        const coursesCollection = db.collection<Course>("courses");

        // Process each course
        const operations = courses.map(async (course: CourseInput) => {
            try {
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
                    // Create default batch data
                    const defaultBatch: BatchInput = {
                        startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                        endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
                        seats: 30,
                        enrolledStudents: 0,
                        status: 'upcoming',
                        batchCode: `${validatedCourse.title?.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}${(new Date().getMonth() + 2).toString().padStart(2, '0')}`
                    };

                    // Insert new course with default batch if none provided
                    const courseWithDefaults: Course = {
                        ...validatedCourse as Course,
                        batches: validatedCourse.batches || [validateBatch(defaultBatch)],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return coursesCollection.insertOne(courseWithDefaults);
                }
            } catch (error) {
                console.error('Error processing course:', course.title, error);
                throw error;
            }
        });

        await Promise.all(operations);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating courses:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to update courses' 
        }, { status: 500 });
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

        // Check if course has active enrollments
        const course = await db.collection<Course>("courses").findOne({ _id: new ObjectId(id) });
        if (course?.batches?.some(batch => 
            batch.status === 'ongoing' && batch.enrolledStudents > 0
        )) {
            return NextResponse.json({ 
                error: 'Cannot delete course with active enrollments' 
            }, { status: 400 });
        }

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