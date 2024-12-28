import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const client = new MongoClient(uri);

  try {
    const { id } = await Promise.resolve(context.params);
    const courseData = await request.json();

    await client.connect();
    const db = client.db("codecraft");

    // Remove _id from update data if it exists
    const { _id, ...updateData } = courseData;

    // Prepare the update document according to schema
    const courseUpdate = {
      title: updateData.title,
      description: updateData.description,
      price: Number(updateData.price),
      image: updateData.image,
      duration: updateData.duration || "4 weeks",
      level: updateData.level || "Beginner",
      features: Array.isArray(updateData.features) ? updateData.features : [],
      isActive: Boolean(updateData.isActive),
      updatedAt: new Date(),
      // Add required fields from schema
      enrollmentCount: updateData.enrollmentCount || 0,
      rating: updateData.rating || {
        average: 0,
        count: 0
      },
      categories: updateData.categories || [],
      requirements: updateData.requirements || [],
      language: updateData.language || "English",
      certificate: updateData.certificate !== false
    };

    const result = await db.collection("courses").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: courseUpdate },
      { 
        returnDocument: 'after',
        // Bypass schema validation if needed
        // bypassDocumentValidation: true 
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const client = new MongoClient(uri);

  try {
    const { id } = await Promise.resolve(context.params);

    await client.connect();
    const db = client.db("codecraft");

    const result = await db.collection("courses").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 