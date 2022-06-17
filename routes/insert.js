import { collection, update } from '../db.js';
import { menu } from './menu.js';
import { MenuItem, response, printInfo, getFieldType } from '../utils.js';

let query = {};

export async function addDocument(data, reset = true) {
    if (reset) query = {};
    const menuItems = [
        new MenuItem(1, "Add Field", () => addField(data)),
        new MenuItem(2, "Upload Document", () => uploadDocument(data)),
        new MenuItem(3, "Return", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        addDocument(data);
        return;
    }
}

async function addField(data) {
    const newField = await getFieldType(data.db, data.collection);
    if (!newField) {
        addDocument(data, false);
        return;
    }
    query[newField.field] = newField.value;
    printInfo(data.db, data.collection, "Your document:");
    console.log(query);
    addDocument(data, false);
}

async function uploadDocument(data) {
    const usedCollection = collection(data.db, data.collection);
    if (!query || query.length === 0) {
        printInfo(data.db, data.collection, "No document to upload");
        addDocument(data);
        return;
    }
    await usedCollection.insertOne(query);
    await update(data, "Insert");
    const document = await usedCollection.findOne(query);
    printInfo(data.db, data.collection, "Document added successfully");
    console.log(document);
    menu(data);
}