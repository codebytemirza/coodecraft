const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection retry options
  connectTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  waitQueueTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true
});

// Helper function to wait between retries
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectWithRetry(maxRetries = 3) {
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

async function setupDatabase() {
  try {
    // Try to connect with retry mechanism
    await connectWithRetry();

    const db = client.db("codecraft");
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log("Database ping successful!");

    // Create collections with schemas
    console.log("Setting up collections...");

    // Users Collection
    console.log("Creating users collection...");
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "name", "password", "role", "createdAt"],
          properties: {
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            name: { bsonType: "string" },
            password: { bsonType: "string" },
            role: { enum: ["student", "admin", "instructor"] },
            avatar: { bsonType: "string" },
            phone: { bsonType: "string" },
            enrolledCourses: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["courseId", "enrollmentDate", "status"],
                properties: {
                  courseId: { bsonType: "objectId" },
                  enrollmentDate: { bsonType: "date" },
                  status: { enum: ["active", "completed", "dropped"] },
                  progress: { bsonType: "int" },
                  certificateIssued: { bsonType: "bool" }
                }
              }
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      }
    });

    // Courses Collection
    console.log("Creating courses collection...");
    await db.createCollection("courses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "description", "price", "image", "duration", "level"],
          properties: {
            title: { bsonType: "string" },
            description: { bsonType: "string" },
            price: { bsonType: "number" }, // Changed from double to number for flexibility
            image: { bsonType: "string" },
            duration: { bsonType: "string" },
            level: { enum: ["Beginner", "Intermediate", "Advanced"] },
            features: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            instructors: {
              bsonType: "array",
              items: { bsonType: "objectId" }
            },
            curriculum: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["title", "content"],
                properties: {
                  title: { bsonType: "string" },
                  content: { bsonType: "string" },
                  duration: { bsonType: "string" }
                }
              }
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            isActive: { bsonType: "bool" }
          }
        }
      }
    });

    // Batches Collection
    console.log("Creating batches collection...");
    await db.createCollection("batches", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["courseId", "startDate", "endDate"],
          properties: {
            courseId: { bsonType: "objectId" },
            batchCode: { bsonType: "string" },
            startDate: { bsonType: "date" },
            endDate: { bsonType: "date" },
            schedule: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  day: { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
                  startTime: { bsonType: "string" },
                  endTime: { bsonType: "string" }
                }
              }
            },
            enrolledStudents: {
              bsonType: "array",
              items: { bsonType: "objectId" }
            },
            instructorId: { bsonType: "objectId" },
            isActive: { bsonType: "bool" }
          }
        }
      }
    });

    // Payments Collection
    console.log("Creating payments collection...");
    await db.createCollection("payments", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "courseId", "amount", "transactionId", "status"],
          properties: {
            userId: { bsonType: "objectId" },
            courseId: { bsonType: "objectId" },
            amount: { bsonType: "number" },
            transactionId: { bsonType: "string" },
            paymentDate: { bsonType: "date" },
            status: { enum: ["pending", "completed", "failed", "refunded"] },
            paymentMethod: { bsonType: "string" },
            metadata: {
              bsonType: "object",
              properties: {
                batchId: { bsonType: "objectId" },
                couponCode: { bsonType: "string" },
                discount: { bsonType: "number" }
              }
            }
          }
        }
      }
    });

    // Notifications Collection
    console.log("Creating notifications collection...");
    await db.createCollection("notifications", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["type", "message", "createdAt"],
          properties: {
            type: { enum: ["course", "batch", "payment", "system"] },
            title: { bsonType: "string" },
            message: { bsonType: "string" },
            recipients: {
              bsonType: "array",
              items: { bsonType: "objectId" }
            },
            courseId: { bsonType: "objectId" },
            batchId: { bsonType: "objectId" },
            isRead: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            expiresAt: { bsonType: "date" }
          }
        }
      }
    });

    // Create indexes
    console.log("Creating indexes...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("courses").createIndex({ title: 1 });
    await db.collection("payments").createIndex({ transactionId: 1 }, { unique: true });
    await db.collection("batches").createIndex({ batchCode: 1 }, { unique: true });
    await db.collection("notifications").createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

    console.log("Database setup completed successfully!");

  } catch (error) {
    console.error("Error setting up database:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    if (error.code === 'ESERVFAIL') {
      console.error("\nTroubleshooting steps:");
      console.error("1. Check if MongoDB Atlas is accessible from your network");
      console.error("2. Verify that your IP address is whitelisted in MongoDB Atlas");
      console.error("3. Ensure the cluster name 'codecraftcluster' is correct");
      console.error("4. Try pinging 'codecraftcluster.xf7di.mongodb.net' to check DNS resolution");
    }
  } finally {
    await client.close();
  }
}

// Add error handling for the promise rejection
setupDatabase()
  .catch(error => {
    console.error("Fatal error during database setup:", error);
    process.exit(1);
  });