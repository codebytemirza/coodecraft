// update_courses_batch.js

const { MongoClient, ServerApiVersion } = require('mongodb');

const config = {
  uri: "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site",
  dbName: "codecraft"
};

async function updateCoursesWithBatch() {
  const client = new MongoClient(config.uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(config.dbName);
    const coursesCollection = db.collection('courses');

    // Get all courses
    const courses = await coursesCollection.find({}).toArray();
    console.log(`📚 Found ${courses.length} courses to update`);

    // Generate batch dates
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 4, 0);

    // Update each course
    for (const course of courses) {
      // Only update if batches don't exist
      if (!course.batches || course.batches.length === 0) {
        const updateResult = await coursesCollection.updateOne(
          { _id: course._id },
          {
            $set: {
              batches: [
                {
                  startDate: nextMonth,
                  endDate: threeMonthsLater,
                  seats: 30,
                  enrolledStudents: 0,
                  status: 'upcoming',
                  batchCode: `${course.title.substring(0, 3).toUpperCase()}-${nextMonth.getFullYear()}${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`
                }
              ]
            }
          }
        );

        console.log(`✅ Updated course: ${course.title}`);
        console.log(`   Batch Code: ${course.title.substring(0, 3).toUpperCase()}-${nextMonth.getFullYear()}${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`);
        console.log(`   Modified: ${updateResult.modifiedCount} document(s)\n`);
      } else {
        console.log(`ℹ️ Skipped ${course.title} - already has batch information\n`);
      }
    }

    console.log('🎉 Batch update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating courses:', error);
    throw error;
  } finally {
    await client.close();
    console.log('👋 Database connection closed');
  }
}

// Run the update
updateCoursesWithBatch().catch(console.error);