import { } from 'dotenv/config';
import { init, access } from './db.js';
import { getDataBase, printInfo } from './utils.js';
import { menu } from './routes/menu.js';

const data = Object;

process.stdin.on('keypress', (str, key) => {
    if (key.name === "escape") process.exit(); // if preseed escape key, exit
});

async function main() {
    console.clear();
    console.log("Welcome to MongoDB database editor");
    data.editor = await access();
    console.clear();
    await getDataBase(data);
    printInfo(data.db, data.collection);
    await menu(data);
}

init().then(main());