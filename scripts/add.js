const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection URI
const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

const client = new MongoClient(uri);

async function seedCourses() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!');

    const db = client.db("codecraft");
    const coursesCollection = db.collection("courses");

    // Read the courses data
    const coursesData = require('../src/data/courses.json');

    // Prepare courses with proper MongoDB schema
    const preparedCourses = coursesData.courses.map(course => ({
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      duration: course.duration || "Not specified",
      level: course.level || "Beginner",
      features: course.features || [],
      instructors: [], // Empty array for now
      curriculum: [], // Empty array for now
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      enrollmentCount: 0,
      rating: {
        average: 0,
        count: 0
      },
      categories: getCourseCategories(course.title), // Helper function to categorize courses
      requirements: [],
      language: "English",
      certificate: true
    }));

    // Insert all courses
    const result = await coursesCollection.insertMany(preparedCourses);
    
    console.log(`Successfully inserted ${result.insertedCount} courses!`);
    console.log('\nCourse Titles Added:');
    preparedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
    });

    // Create indexes for better performance
    await coursesCollection.createIndex({ title: 1 });
    await coursesCollection.createIndex({ level: 1 });
    await coursesCollection.createIndex({ price: 1 });
    await coursesCollection.createIndex({ "rating.average": -1 });
    
    console.log('\nCreated indexes for optimal querying');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

// Helper function to categorize courses
function getCourseCategories(title) {
  const categories = [];
  const titleLower = title.toLowerCase();

  if (titleLower.includes('python')) categories.push('Python');
  if (titleLower.includes('c++')) categories.push('C++');
  if (titleLower.includes('web')) categories.push('Web Development');
  if (titleLower.includes('machine learning')) categories.push('Machine Learning');
  if (titleLower.includes('deep learning')) categories.push('Deep Learning');
  if (titleLower.includes('ai')) categories.push('Artificial Intelligence');
  if (titleLower.includes('mern')) {
    categories.push('Web Development');
    categories.push('Full Stack');
    categories.push('MERN Stack');
  }

  // Add difficulty level as category
  if (titleLower.includes('fundamental') || titleLower.includes('basics')) {
    categories.push('Beginner Friendly');
  }
  if (titleLower.includes('advanced')) {
    categories.push('Advanced');
  }

  return categories;
}

// Run the seed function
seedCourses()
  .then(() => {
    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error during seeding:', error);
    process.exit(1);
  });