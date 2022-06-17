import { ObjectId } from 'mongodb';
import { collection, update } from '../db.js';
import { menu } from './menu.js';
import { MenuItem, printInfo, response } from '../utils.js';

export async function deleteDocument(data) {
    const menuItems = [
        new MenuItem(1, "Delete one document", () => deleteDocuments(data, false)),
        new MenuItem(2, "Delete many documents", () => deleteDocuments(data, true)),
        new MenuItem(3, "Return", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        deleteDocument(data);
        return;
    }
}

async function deleteDocuments(data, many) {
    const usedCollection = collection(data.db, data.collection);
    let query = {};
    let document;
    if (many) {
        let field = await response("Search field: ");
        const value = await response("Search value: ");
        query[field] = value;
        document = await usedCollection.find(query).toArray();
    } else {
        const value = await response("Enter document id: ");
        const id = new ObjectId(value);
        query["_id"] = id;
        document = await usedCollection.findOne({ _id: id });
    }
    if (!document || document.length == 0) {
        printInfo(data.db, data.collection, "No documents found");
        deleteDocument(data, false);
        return;
    }
    console.log("Are you sure you want to delete " + (many ? "these documents" : "this document") + "?");
    console.log(document);
    const menuItems = [
        new MenuItem(1, "Yes", () => deleteDocumentsConfirmed(data, many, query)),
        new MenuItem(2, "No", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        deleteDocuments(data, many);
        return;
    }
}

async function deleteDocumentsConfirmed(data, many, query) {
    const usedCollection = collection(data.db, data.collection);
    if (many) await usedCollection.deleteMany(query);
    else await usedCollection.deleteOne(query);
    await update(data, "Delete");
    printInfo(data.db, data.collection, "Documents deleted");
    menu(data);
}