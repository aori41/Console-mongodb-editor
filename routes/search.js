import { ObjectId } from 'mongodb';
import { collection } from '../db.js';
import { menu } from './menu.js';
import { MenuItem, response, printInfo } from '../utils.js';

export async function searchDocument(data) {
    const menuItems = [
        new MenuItem(1, "Search one document", () => searchDocuments(data, false)),
        new MenuItem(2, "Search many documents", () => searchDocuments(data, true)),
        new MenuItem(3, "Return", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        searchDocument(data);
        return;
    }
}

async function searchDocuments(data, many) {
    const usedCollection = collection(data.db, data.collection);
    let document;
    if (many) {
        const mainMenu = [
            new MenuItem(1, "Find all documents", async () => document = await usedCollection.find({}).toArray()),
            new MenuItem(2, "Search by field", async () => document = await usedCollection.find(await getFieldQuery(data)).toArray())
        ];
        const menuOptions = mainMenu.map(item => `${item.index}. ${item.name}`).join("\n");
        console.log(menuOptions);
        const answer = await response("Enter your choice: ");
        const menuItem = mainMenu.find(item => item.index == answer);
        printInfo(data.db, data.collection);
        if (menuItem) await menuItem.func();
        else {
            searchDocuments(data, many);
            return;
        }
    } else {
        const value = await response("Enter document id: ");
        if (!value || value.length != 24) {
            printInfo(data.db, data.collection, "Invalid id");
            searchDocument(data);
            return;
        }
        const id = new ObjectId(value);
        document = await usedCollection.findOne({ _id: id });
    }
    if (!document || document.length == 0) {
        printInfo(data.db, data.collection, "No documents found");
        searchDocument(data);
        return;
    }
    printInfo(data.db, data.collection, document);
    menu(data);
}

async function getFieldQuery(data) {
    let query = {};
    const field = await response("Search field: ");
    const value = await response("Search value: ");
    const strMenu = [
        new MenuItem(1, "In", () => query[field] = { $in: value.split(",") }),
        new MenuItem(2, "Not in", () => query[field] = { $nin: value.split(",") })
    ];
    const numbersMenu = [
        new MenuItem(1, "Less than", () => query[field] = { $lt: value }),
        new MenuItem(2, "Less than or equal", () => query[field] = { $lte: value }),
        new MenuItem(3, "Greater than", () => query[field] = { $gt: value }),
        new MenuItem(4, "Greater than or equal", () => query[field] = { $gte: value }),
        new MenuItem(5, "Equal to", () => query[field] = { $eq: value }),
        new MenuItem(6, "Not equal to", () => query[field] = { $ne: value })
    ];
    let menuOptions;
    if (!isNaN(value)) menuOptions = numbersMenu.map(item => `${item.index}. ${item.name}`).join("\n");
    else menuOptions = strMenu.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    let menuItem;
    if (!isNaN(value)) menuItem = numbersMenu.find(item => item.index == answer);
    else menuItem = strMenu.find(item => item.index == answer);
    if (menuItem) menuItem.func();
    else {
        printInfo(data.db, data.collection);
        searchDocument(data);
        return;
    }
    return query;
}