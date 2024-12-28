import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin:codecraft@codecraftcluster.xf7di.mongodb.net/?retryWrites=true&w=majority&appName=CodeCraftCluster";

export async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
} 