import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export class MenuItem { // menu handler
    constructor(index, name, func) {
        this.index = index;
        this.name = name;
        this.func = func;
    }
}

export async function getDataBase(data) {
    data.db = await response("Enter database name: ");
    data.collection = await response("Enter collection name: ");
    if (!isNaN(data.db) || !isNaN(data.collection)) {
        console.log("Invalid database or collection name");
        await getDataBase(data);
    }
    console.clear();
    return data;
}

export function printInfo(db, collection, info) {
    console.clear();
    console.log("Connected to database: " + db + ", collection: " + collection);
    if (info) console.log(info);
}

export function response(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            if (answer) resolve(answer);
            else resolve(response(question));
        });
    });
}

export function getFieldType(db, dbCollection, field) {
    return new Promise(async (resolve) => {
        const type = await typesMenu();
        const data = Object;
        if (type == "return") {
            printInfo(db, dbCollection);
            resolve(false);
            return;
        }
        printInfo(db, dbCollection);
        if (!field) data.field = await response("Enter field name: ");
        else data.field = field;
        if (type == "date") {
            data.value = new Date();
            resolve(data);
            return;
        }
        const answer = await response("Enter " + type + " value: ");
        switch (type) {
            case "array": {
                data.value = answer.replaceAll(" ", "").split(",");
                break;
            }
            case "object": {
                if (!answer.startsWith("{") || !answer.endsWith("}")) {
                    printInfo(db, dbCollection, "Invalid object - use '{' '}'");
                    resolve(false);
                    return;
                }
                for (let i = 0; i < answer.split(":").length - 1; i++) {
                    let objField = answer.split(":")[i].replaceAll("{", "");
                    let validName;
                    if (objField.includes(",")) {
                        for (let j = 0; j < objField.split(",").length - 1; j++) {
                            validName = objField.split(",")[j + 1].replaceAll(" ", "");
                        }
                    } else validName = objField;
                    if ((!validName.startsWith("\"") || !validName.endsWith("\"")) && (!validName.startsWith("\'") || !validName.endsWith("\'"))) {
                        printInfo(db, dbCollection, "Invalid object - use " + '"' + " or " + "'" + " around the field name");
                        resolve(false);
                        return;
                    }
                }
                let count = 0;
                for (let i = 0; i < answer.length; i++) {
                    if (answer[i] == "{" || answer[i] == "[") count++;
                    if (answer[i] == "}" || answer[i] == "]") count--;
                }
                if (count != 0) {
                    printInfo(db, dbCollection, "Invalid object - use ('{' '}'/'[' ']') in the right order");
                    resolve(false);
                    return;
                }
                data.value = JSON.parse(answer);
                break;
            }
            case "string": {
                data.value = answer;
                break;
            }
            case "number": {
                if (isNaN(answer)) {
                    printInfo(db, dbCollection, "Value must be a number");
                    resolve(false);
                    return;
                }
                data.value = parseInt(answer);
                break;
            }
            case "boolean": {
                if (answer != "true" && answer != "false" && answer != "1" && answer != "0") {
                    printInfo(db, dbCollection, "Value must be true/false or 1/0");
                    resolve(false);
                    return;
                }
                data.value = (answer == "true" || answer == "1") ? true : false;
                break;
            }
        }
        resolve(data);
    });
}

function typesMenu(db, collection) {
    return new Promise(async (resolve) => {
        const typesMenuItems = [
            new MenuItem(1, "Array", () => resolve("array")),
            new MenuItem(2, "Object", () => resolve("object")),
            new MenuItem(3, "String", () => resolve("string")),
            new MenuItem(4, "Number", () => resolve("number")),
            new MenuItem(5, "Boolean", () => resolve("boolean")),
            new MenuItem(6, "Date", () => resolve("date")),
            new MenuItem(7, "Return", () => resolve("return"))
        ];
        const typesMenuOptions = typesMenuItems.map(item => `${item.index}. ${item.name}`).join("\n");
        console.log(typesMenuOptions);
        const answer = await response("Enter your choice: ");
        const typesMenuItem = typesMenuItems.find(item => item.index == answer);
        printInfo(db, collection);
        if (typesMenuItem) typesMenuItem.func();
        else resolve("return");
    });
}