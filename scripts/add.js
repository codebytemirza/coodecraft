const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  uri: "mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site",
  dbName: "codecraft",
  maxRetries: 5,
  retryInterval: 2000,
  connection: {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    waitQueueTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 50,
    minPoolSize: 10
  }
};

// Helper function to wait between retries
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectWithRetry(client, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connection attempt ${attempt} of ${maxRetries}...`);
      await client.connect();
      console.log('Successfully connected to MongoDB!');
      return true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait for 2 seconds before retrying
      await wait(2000);
    }
  }
}

async function seedCourses() {
  const client = new MongoClient(config.uri, config.connection);

  try {
    // Try to connect with retry mechanism
    await connectWithRetry(client, config.maxRetries);

    const db = client.db(config.dbName);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Manually defined course data
    const coursesData = [
      {
        id: 1,
        title: "C++ Programming Fundamentals",
        description: "Learn the basics of C++ programming.",
        price: 1000,
        image: "/images/course-1-1735173739045.jpg",
        duration: "4 weeks",
        level: "Beginner",
        features: [
          "Syntax and Variables",
          "Loops and Conditions",
          "Basic Programs"
        ]
      },
      {
        id: 2,
        title: "C++ Object-Oriented Programming",
        description: "Master the fundamentals of OOP in C++.",
        price: 2000,
        image: "/images/course-2-1735173827919.jpg",
        duration: "6 weeks",
        level: "Intermediate",
        features: [
          "Classes and Objects",
          "Inheritance",
          "Polymorphism"
        ]
      },
      {
        id: 3,
        title: "C++ Data Structures and Algorithms",
        description: "Learn DSA concepts in C++ for problem-solving.",
        price: 5000,
        image: "/images/course-3-1735173925660.png",
        duration: "8 weeks",
        level: "Advanced",
        features: [
          "Arrays, Stacks, Queues",
          "Trees and Graphs",
          "Sorting and Searching Algorithms"
        ]
      },
      {
        id: 4,
        title: "Python Programming Fundamentals",
        description: "Learn Python from the ground up.",
        price: 1000,
        image: "/images/course-4-1735174033082.jpg",
        duration: "4 weeks",
        level: "Beginner",
        features: [
          "Syntax and Variables",
          "Loops and Conditions",
          "Basic Programs"
        ]
      },
      {
        id: 5,
        title: "Python Object-Oriented Programming",
        description: "Dive into OOP with Python.",
        price: 2000,
        image: "/images/course-5-1735174102162.png",
        duration: "6 weeks",
        level: "Intermediate",
        features: [
          "Classes and Objects",
          "Inheritance",
          "Polymorphism"
        ]
      },
      {
        id: 6,
        title: "Python Data Structures and Algorithms",
        description: "Master DSA concepts with Python.",
        price: 5000,
        image: "/images/course-6-1735174159028.jfif",
        duration: "8 weeks",
        level: "Advanced",
        features: [
          "Lists, Stacks, Queues",
          "Trees and Graphs",
          "Sorting and Searching Algorithms"
        ]
      },
      {
        id: 7,
        title: "Python Modules Masterclass",
        description: "Advanced course focusing on popular Python libraries.",
        price: 6000,
        image: "/images/course-7-1735174221204.png",
        duration: "6 weeks",
        level: "Intermediate",
        features: [
          "NumPy",
          "Pandas",
          "Matplotlib"
        ]
      },
      {
        id: 8,
        title: "Machine Learning",
        description: "Comprehensive course on machine learning.",
        price: 10000,
        image: "/images/course-8-1735174266044.png",
        duration: "12 weeks",
        level: "Advanced",
        features: [
          "Supervised Learning",
          "Unsupervised Learning",
          "Model Evaluation"
        ]
      },
      {
        id: 9,
        title: "Deep Learning",
        description: "Dive into advanced neural networks and deep learning.",
        price: 12000,
        image: "/images/course-9-1735174303874.png",
        duration: "12 weeks",
        level: "Advanced",
        features: [
          "Neural Networks",
          "CNNs and RNNs",
          "Transfer Learning"
        ]
      },
      {
        id: 10,
        title: "Generative AI",
        description: "Learn to build generative AI applications.",
        price: 15000,
        image: "/images/course-10-1735174355077.webp",
        duration: "14 weeks",
        level: "Advanced",
        features: [
          "GANs",
          "Transformers",
          "Large Language Models"
        ]
      },
      {
        id: 11,
        title: "Web Development with HTML, CSS, JavaScript",
        description: "Learn the basics of front-end web development.",
        price: 3000,
        image: "/images/course-11-1735174386394.jpg",
        duration: "6 weeks",
        level: "Beginner",
        features: [
          "HTML5",
          "CSS3",
          "JavaScript Basics"
        ]
      },
      {
        id: 1735199410535,
        title: "Mern Stack Development 2025",
        description: "Advanced full stack development course",
        price: 10000,
        image: "/images/course-1735199410535-1735199508345.jpg",
        features: [
          "Node js",
          "Next js",
          "Mongodb",
          "react",
          "express js"
        ]
      }
    ];

    // Upload images to GridFS and get their IDs
    const uploadImage = async (imagePath) => {
      const imageStream = fs.createReadStream(path.join(__dirname, '..', 'public', imagePath));
      const uploadStream = bucket.openUploadStream(path.basename(imagePath));
      const id = uploadStream.id;
      imageStream.pipe(uploadStream);
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });
      return id;
    };

    // Prepare courses with proper MongoDB schema
    const preparedCourses = await Promise.all(coursesData.map(async (course) => {
      const imageId = await uploadImage(course.image);
      return {
        title: course.title,
        description: course.description,
        price: course.price,
        imageId: imageId,
        duration: course.duration || "Not specified",
        level: course.level || "Beginner",
        features: course.features || [],
        instructors: [], // Empty array for now
        curriculum: [], // Empty array for now
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isEnrollmentOpen: true, // Default to true
        enrollmentCount: 0,
        rating: {
          average: 0,
          count: 0
        },
        categories: getCourseCategories(course.title), // Helper function to categorize courses
        requirements: [],
        language: "English",
        certificate: true
      };
    }));

    // Insert all courses
    const coursesCollection = db.collection("courses");
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
