import { MongoClient } from 'mongodb';
import { response } from './utils.js';

const client = new MongoClient(process.env.DATA_BASE);

const accessCollection = client.db("migration").collection("access");
const editsCollection = client.db("migration").collection("edits");

export async function init() {
    client.connect(async () => {// first configuration or manually 
        const admin = await accessCollection.findOne({ name: "or" });
        if (!admin) await accessCollection.insertOne({ name: "or", key: "123" });
    });
}

export function collection(db, collection) {
    return client.db(db).collection(collection);
}

export async function access() {
    const key = await response("Enter access key: ");
    const userAccess = await accessCollection.findOne({ key });
    if (!userAccess) {
        console.log("Access denied");
        process.exit();
    }
    return userAccess.name; // get editor name by his key
}

export async function update(data, action) {
    let lastUpdated = new Date();
    const exist = await editsCollection.findOne({ db: data.db, collection: data.collection });
    if (exist) {
        await editsCollection.updateOne({ db: data.db, collection: data.collection }, {
            "$set": {
                action,
                editor: data.editor,
                lastUpdated
            }
        });
    } else {
        await editsCollection.insertOne({
            editor: data.editor,
            db: data.db,
            collection: data.collection,
            action,
            lastUpdated
        });
    }
}