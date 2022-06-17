import { ObjectId } from 'mongodb';
import { collection, update } from '../db.js';
import { menu } from './menu.js';
import { MenuItem, response, printInfo, getFieldType } from '../utils.js';

export async function editDocument(data) {
    const menuItems = [
        new MenuItem(1, "Edit one document", () => editDocuments(data, false)),
        new MenuItem(2, "Edit many documents", () => editDocuments(date, true)),
        new MenuItem(3, "Return", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        editDocument(data);
        return;
    }
}

async function editDocuments(data, many) {
    const usedCollection = collection(data.db, data.collection);
    let query = {};
    if (many) {
        let field = await response("Search field: ");
        const value = await response("Search value: ");
        query[field] = value;
    } else {
        const value = await response("Enter document id: ");
        const id = new ObjectId(value);
        query["_id"] = id;
    }
    const queryExists = await usedCollection.findOne(query);
    if (!queryExists) {
        printInfo(data.db, data.collection, "No documents found");
        editDocument(data);
        return;
    }
    const menuItems = [
        new MenuItem(1, "Edit field", () => edit(data, query, "edit_field")),
        new MenuItem(2, "Edit value", () => edit(data, query, "edit_value")),
        new MenuItem(3, "Add field", () => edit(data, query, "add_field")),
        new MenuItem(4, "Remove field", () => edit(data, query, "remove_field")),
        new MenuItem(5, "Return", () => menu(data))
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        editDocuments(data, many);
        return;
    }
}

async function edit(data, query, action) {
    const usedCollection = collection(data.db, data.collection);
    const items = await usedCollection.findOne(query);
    const fields = Object.keys(items);
    const values = Object.values(items);
    const newQuery = {};
    let result;
    let field;
    if (action != "add_field") field = await selectField(fields, data.db, data.collection);
    if (action == "remove_field") {
        for (let i = 0; i < fields.length; i++) {
            if (fields[i] == field) {
                newQuery[fields[i]] = values[i];
                result = await usedCollection.updateMany(query, { $unset: newQuery });
                break;
            }
        }
        await update(data, "Update");
        printInfo(data.db, data.collection, `${result.modifiedCount} documents updated`);
        editDocument(data);
        return;
    }
    console.log("Choose a type for the new field: ");
    let fieldType;
    if (field) fieldType = await getFieldType(data.db, data.collection, field);
    else fieldType = await getFieldType(data.db, data.collection);
    if (!fieldType) {
        editDocument(data);
        return;
    }
    switch (action) {
        case "edit_field": {
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] == field) {
                    newQuery[fieldType.field] = fieldType.value;
                    break;
                }
            }
            result = await usedCollection.updateMany(query, { $rename: newQuery });
            break;
        }
        case "edit_value": {
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] != "_id") {
                    if (fields[i] == field) newQuery[fields[i]] = fieldType.value;
                    else newQuery[fields[i]] = values[i];
                }
            }
            result = await usedCollection.updateMany(query, { $set: newQuery });
            break;
        }
        case "add_field": {
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] != "_id") {
                    newQuery[fields[i]] = values[i];
                }
            }
            newQuery[fieldType.field] = fieldType.value;
            result = await usedCollection.updateMany(query, { $set: newQuery });
            break;
        }
    }
    await update(data, "Update");
    printInfo(data.db, data.collection, `${result.modifiedCount} documents updated`);
    editDocument(data);
}

async function selectField(fields, db, collection) {
    const menuItems = fields.map((field, index) => new MenuItem(index, field, () => field));
    menuItems.splice(0, 1); // remove _id from the menu
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(db, collection);
    if (menuItem) return menuItem.func();
    else return selectField(fields, db, collection);
}