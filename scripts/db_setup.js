const { MongoClient, ServerApiVersion } = require('mongodb');

// Configuration
const config = {
  uri:"mongodb+srv://abdullah:siteadmin@site.6orgr.mongodb.net/?retryWrites=true&w=majority&appName=site",
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

// Rest of the code remains the same as before, starting with schemas...
const schemas = {
  users: {
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
  },
  courses: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "description", "price", "imageId", "duration", "level"],
        properties: {
          title: { bsonType: "string" },
          description: { bsonType: "string" },
          price: { bsonType: "number" },
          imageId: { bsonType: "objectId" },
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
          isActive: { bsonType: "bool" },
          isEnrollmentOpen: { bsonType: "bool" }
        }
      }
    }
  },
  payments: {
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
              couponCode: { bsonType: "string" },
              discount: { bsonType: "number" }
            }
          }
        }
      }
    }
  },
  enrollments: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "courseId", "enrollmentDate", "status"],
        properties: {
          userId: { bsonType: "objectId" },
          courseId: { bsonType: "objectId" },
          enrollmentDate: { bsonType: "date" },
          status: { enum: ["active", "completed", "dropped"] },
          progress: { bsonType: "int" },
          certificateIssued: { bsonType: "bool" }
        }
      }
    }
  }
};

// Indexes configuration
const indexes = {
  users: [
    { key: { email: 1 }, options: { unique: true } },
    { key: { role: 1 }, options: {} }
  ],
  courses: [
    { key: { title: 1 }, options: {} },
    { key: { level: 1 }, options: {} },
    { key: { price: 1 }, options: {} }
  ],
  payments: [
    { key: { transactionId: 1 }, options: { unique: true } },
    { key: { userId: 1 }, options: {} },
    { key: { status: 1 }, options: {} }
  ],
  enrollments: [
    { key: { userId: 1, courseId: 1 }, options: { unique: true } },
    { key: { status: 1 }, options: {} }
  ]
};

class DatabaseSetup {
  constructor() {
    this.client = new MongoClient(config.uri, config.connection);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async connect(attempt = 1) {
    try {
      console.log(`📡 Connection attempt ${attempt} of ${config.maxRetries}...`);
      await this.client.connect();
      console.log('✅ Successfully connected to MongoDB!');
      return true;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      if (attempt === config.maxRetries) throw error;
      await this.wait(config.retryInterval);
      return this.connect(attempt + 1);
    }
  }

  async createCollections(db) {
    console.log('📚 Creating collections...');
    for (const [name, schema] of Object.entries(schemas)) {
      try {
        await db.createCollection(name, schema);
        console.log(`✅ Created ${name} collection`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️ Collection ${name} already exists, updating schema...`);
          await db.command({
            collMod: name,
            validator: schema.validator
          });
        } else {
          throw error;
        }
      }
    }
  }

  async createIndexes(db) {
    console.log('📇 Creating indexes...');
    for (const [collection, collectionIndexes] of Object.entries(indexes)) {
      for (const index of collectionIndexes) {
        try {
          await db.collection(collection).createIndex(index.key, index.options);
          console.log(`✅ Created index for ${collection}: ${JSON.stringify(index.key)}`);
        } catch (error) {
          console.error(`❌ Error creating index for ${collection}:`, error.message);
          throw error;
        }
      }
    }
  }

  async setup() {
    try {
      await this.connect();
      const db = this.client.db(config.dbName);

      // Test connection
      await db.command({ ping: 1 });
      console.log("✅ Database ping successful!");

      // Setup collections and indexes
      await this.createCollections(db);
      await this.createIndexes(db);

      console.log('🚀 Database setup completed successfully!');
    } catch (error) {
      console.error('❌ Error during database setup:');
      console.error('Name:', error.name);
      console.error('Message:', error.message);
      console.error('Code:', error.code);

      if (error.code === 'ESERVFAIL' || error.code === 'ETIMEOUT') {
        console.error('\n🔍 Troubleshooting steps:');
        console.error('1. Check MongoDB Atlas network access');
        console.error('2. Verify IP whitelist in MongoDB Atlas');
        console.error('3. Check DNS resolution');
        console.error('4. Verify network/firewall settings');
      }
      throw error;
    } finally {
      await this.client.close();
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await client?.close();
    console.log('\n👋 Database connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
});

// Run setup
const dbSetup = new DatabaseSetup();
dbSetup.setup().catch(error => {
  console.error('❌ Fatal error during database setup:', error);
  process.exit(1);
});