
import { addDocument } from './insert.js';
import { editDocument } from './update.js';
import { deleteDocument } from './delete.js';
import { searchDocument } from './search.js';
import { MenuItem, getDataBase, response, printInfo } from '../utils.js';

let data = Object;

async function updateDataBase(editor) {
    await getDataBase(data);
    data.editor = editor;
    printInfo(data.db, data.collection);
    menu(data);
}

export async function menu(data) { // main menu
    const menuItems = [
        new MenuItem(1, "Add document", () => addDocument(data)),
        new MenuItem(2, "Edit document", () => editDocument(data)),
        new MenuItem(3, "Delete document", () => deleteDocument(data)),
        new MenuItem(4, "Search document", () => searchDocument(data)),
        new MenuItem(5, "Return", () => updateDataBase(data.editor)),
        new MenuItem(6, "Exit", () => { process.exit(); })
    ];
    const menuOptions = menuItems.map(item => `${item.index}. ${item.name}`).join("\n");
    console.log(menuOptions);
    const answer = await response("Enter your choice: ");
    const menuItem = menuItems.find(item => item.index == answer);
    printInfo(data.db, data.collection);
    if (menuItem) menuItem.func();
    else {
        menu(data);
        return;
    }
}