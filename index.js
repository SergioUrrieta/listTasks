import { readFileSync, writeFileSync, renameSync } from "fs";
import { createInterface } from "readline";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tasks = [];

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const DB_file = path.join(__dirname, "task.txt");

function displayMenu() {
    console.log(chalk.yellowBright.bold("\n🐺🐺🐺 Tasks of the Shinigami 🐺🐺🐺\n"));
    console.log("1. Agregar tarea");
    console.log("2. Listar tarea");
    console.log("3. Marcar tarea");
    console.log("4. Eliminar tarea");
    console.log("5. Salir");
    console.log("\n");
}

function loadTask() {
    try {
        const data = readFileSync(DB_file, "utf-8");
        const lines = data.split("\n");
        tasks.length = 0;  // Limpiamos el array

        lines.forEach((line) => {
            if (line.trim() !== "") {
                const [task, completed] = line.split("|");
                tasks.push({ task, completed: completed.trim() === "true" });
            }
        });
        console.log(chalk.green.bold("Las tareas se cargaron desde la BD"));
    } catch (error) {
        console.log(chalk.yellow.bold("No hay tareas existentes o error al leer"));
    }
}

function saveTask() {
    const tempFile = DB_file + ".tmp";
    const data = tasks.map((t) => `${t.task}|${t.completed}`).join("\n");
    writeFileSync(tempFile, data, "utf-8");
    renameSync(tempFile, DB_file);
    console.log(chalk.green.bold("Tareas guardadas con éxito"));
}    

function deleteTaskByIndex(index) {
    if (index < 0 || index >= tasks.length) {
        console.log(chalk.red("Número de tarea inválido."));
        return;
    }

    const deleted = tasks[index];
    tasks.splice(index, 1); // Elimina la tarea de memoria

    const tempFile = DB_file + ".tmp";
    const data = tasks.map(t => `${t.task}|${t.completed}`).join("\n");
    writeFileSync(tempFile, data, "utf-8");
    renameSync(tempFile, DB_file);

    console.log(chalk.red.bold(`Tarea "${deleted.task}" eliminada correctamente.`));
}



function addTask() {
    rl.question(chalk.bgRed("Escribe la tarea: "), (taskDescription) => {
        tasks.push({ task: taskDescription, completed: false });
        console.log(chalk.green.bold("\n Tarea agregada con exito \n"));
        saveTask();
        displayMenu();
        chosieOption();
    });
}

function listTask() {
    console.log(chalk.red.bold("\n 🐺🐺🐺 List Task 🐺🐺🐺 \n"));
    if (tasks.length === 0) {
        console.log("there no pending tasks ✅ ");
    } else {
        tasks.forEach((task, index) => {
            let status = task.completed ? "✅" : "❌";
            if (task.completed) {
                console.log(chalk.greenBright(`${index + 1}. ${status}---${task.task}`));
            } else {
                console.log(chalk.redBright(`${index + 1}. ${status}---${task.task}`));
            }
        });
    }
}

function finishTask() {
    if (tasks.length === 0) {
        console.log(chalk.cyanBright("there no pending tasks ✅ "));
        displayMenu();
        chosieOption();
        return;
    }

    listTask(); // Mostramos las tareas

    rl.question("select task for check: ", (entrada) => {
        const index = parseInt(entrada) - 1;
        if (index >= 0 && index < tasks.length) {
            tasks[index].completed = !tasks[index].completed;
            saveTask();
            console.log(chalk.green.bold("\nTarea actualizada con éxito\n"));
        } else {
            console.log(chalk.red.bold("\nNúmero de tarea inválido\n"));
        }
        displayMenu();
        chosieOption();
    });
}

function chosieOption() {
    rl.question("select a option: \n", (chosie) => {
        switch (chosie) {
            case "1":
                addTask();
                break;
            case "2":
                listTask();
                rl.question("\n press 0 to back the menu: ", (cero) => {
                    if (cero === "0") {
                        displayMenu();
                        chosieOption();
                    }
                });
                break;
            case "3":
                finishTask();
                break;

            case "4":

              // Eliminar por número

              rl.question("Número de tarea a eliminar: ", (input) => {
              const indexToDelete = parseInt(input) - 1;
              deleteTaskByIndex(indexToDelete);
              displayMenu();
              chosieOption();
              });
              break;
            case "5":
                console.log(chalk.yellowBright("Good bye 🐺🐺🐺"));
                rl.close();
                break;
            default:
                console.log(chalk.bgMagentaBright("invalid option select other: "));
                console.log("");
                displayMenu();
                chosieOption();
                break;
        }
    });
}

// Inicio de la aplicación
loadTask();
displayMenu();
chosieOption();
