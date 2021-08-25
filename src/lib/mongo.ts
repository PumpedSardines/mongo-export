import { MongoClient } from "mongodb";

export default async (uri: string): Promise<MongoClient> => {
    const client = await new MongoClient(uri, {
        connectTimeoutMS: 3000,
        serverSelectionTimeoutMS: 3000
    }).connect();

    return client;
};