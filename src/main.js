const { Plugin, requestUrl, Notice, Modal } = require("obsidian");

module.exports = class SQLNotebookPlugin extends Plugin {
  async onload() {  // Метод, вызываемый при загрузке плагина

    // команда для вставки списка таблиц из postgreSQL, с id и названием
    this.addCommand( 
      {
      id: "insert-tables",
      name: "insert list of tables from PostgreSQL",
      callback: async () => 
        {
        await this.insertTableList();
      }
    });

    // команда для выполнения запроса
    this.addCommand({
      id: "execute-sql",
      name: "execution of the query",
      callback: () => this.createSQLBlock(),
      hotkeys: [{ modifiers: ["Mod"], key: "Enter" }] // горячая клавиша
    });

    // команда для открытия вкладки с инструкциями
    // одна из функций: позволит польззователю находить КРАТКОЕ руководство
    this.addCommand({
      id: "open-instructions",
      name: "Open instructions tab",
      callback: () => this.createInstructionsTab(),
      hotkeys: [{ modifiers: ["Mod"], key: "I" }] // горячая клавиша
    });

    // команда для открытия вкладки с Murder Mystery
    this.addCommand({
      id: "open-Interactive-tool",
      name: "Practice SQL: Murder Mystery",
      callback: () => this.createMMTab(),
      hotkeys: [{ modifiers: ["Mod"], key: "6" }] // горячая клавиша
    });

    // команда для открытия окна ввода овтветов
    this.addCommand({
      id: "murder-mystery",
      name: "Murder Mystery: Guess the name",
      callback: () => this.openMurderMysteryModal(),
      hotkeys: [{ modifiers: ["Ctrl"], key: "0" }] // горячая клавиша Ctrl+0
    });

    console.log("SQL Plugin загружен"); // логи
  }

   // метод для вставки списка таблиц из PostgreSQL
  async insertTableList() {
    try {
      const response = await requestUrl({ url: "http://localhost:3000/tables" }); //отправляем запрос на сервер
      const tableNames = response.json.join("\n"); // соединяем имена таблиц и разделяем \n

      const activeLeaf = this.app.workspace.activeLeaf; // получаем текущий лист (заметку), куда вставялть
      if (activeLeaf && activeLeaf.view.getViewType() === "markdown") 
        {
        const editor = activeLeaf.view.editor;
        editor.replaceSelection(`==Tables in the database:==\n${tableNames}\n`); // == используем для форматирования, которое встроено в сам Обсидиан 
      }
    } 
    catch (err) {
      console.error("Error while receiving data from the server.", err);
      new Notice("Error loading list of tables.");
    }
  }

   // метод для создания SQL-блока
  createSQLBlock() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (!activeLeaf || activeLeaf.view.getViewType() !== "markdown") {
      new Notice("Open file to create SQL-block!");
      return;
    }

    const editor = activeLeaf.view.editor;
    const selection = editor.getSelection().trim(); // получаем выделенный текст и удаляем пробелы

    if (!selection) { // если не выделили, а функцию  запустили
      new Notice("Select the SQL query to create the block.");
      return;
    }

    const blockId = `sql-block-${Date.now()}`;
    // HTML-код для SQL-блока
    const sqlBlock = `
<div class="sql-container">
  <pre class="sql-code">${selection}</pre>
  <button class="sql-run-btn" data-block-id="${blockId}">▶</button>
</div>\n`;

    editor.replaceSelection(sqlBlock);
    setTimeout(() => this.attachRunButtonListeners(), 500);
  }

  attachRunButtonListeners() {
    document.querySelectorAll(".sql-run-btn").forEach(button => {
      if (!button.dataset.listenerAttached) {
        button.dataset.listenerAttached = "true";
        button.addEventListener("click", async () => {
          const sqlQuery = button.previousElementSibling.textContent.trim();
          await this.executeSQLQuery(sqlQuery, button); // Выполняем SQL-запрос
        });
      }
    });
  }


  // метод для выполнения SQL-запроса
  async executeSQLQuery(sql, button) {
    try {
      // отправляем запрос на сервер для выполнения запроса
      const response = await requestUrl({
        url: "http://localhost:3000/query",
        method: "POST",
        body: JSON.stringify({ sql }),
        headers: { "Content-Type": "application/json" }
      });

      const result = response.json;
      let formattedResult = "";

      // Форматируем результат в зависимости от типа SQL-запроса
      // если select -- то таблица
      if (sql.trim().toUpperCase().startsWith("SELECT")){
        formattedResult = this.formatAsTable(result);
      } 
      
      else if (sql.trim().toUpperCase().startsWith("INSERT")) { // insert -- просто выведется увдомление о удачной вставке.
        formattedResult = ` Data insertion completed successfully! `;
      } 
      
      else if (sql.trim().toUpperCase().startsWith("UPDATE")) {
        formattedResult = ` Update completed successfully!`;
      }
      
      else {
        formattedResult = ` Action completed successfully!`;
      }

      new SQLResultModal(this.app, formattedResult, button).open();

    } catch (err) {
      console.error("Request execution error:", err);
      new Notice("an error occurred while executing the query");
    }
  }

  // Метод для форматирования результата как таблицы
  formatAsTable(data) {
    if (!data || data.length === 0) return " Нет данных";

    const headers = Object.keys(data[0]);
    let tableHTML = `<table class="sql-table"><tr>`; // начинаем формировать HTML-код таблицы

    headers.forEach(header => {
      tableHTML += `<th>${header}</th>`;
    });
    tableHTML += `</tr>`;

    data.forEach(row => {
      tableHTML += `<tr>`;
      headers.forEach(header => {
        tableHTML += `<td>${row[header]}</td>`;
      });
      tableHTML += `</tr>`;
    });

    tableHTML += `</table>`;
    return tableHTML; // закрываем таблицу и возваращем ее
  }

  // метод: открываем вкладку-функционал
  async createInstructionsTab() {
    const fileName = "Instructions.md";
    const file = this.app.vault.getAbstractFileByPath(fileName);

    if (file) {
      const leaf = this.app.workspace.splitActiveLeaf();
      await leaf.openFile(file);
    }
    else {
      const instructionsText = `== PostgreSQL: short instructions ==\n\n testing: will be updated later`; // will be replaced with a file
      const newFile = await this.app.vault.create(fileName, instructionsText);
      const leaf = this.app.workspace.splitActiveLeaf();
      await leaf.openFile(newFile);
    }
  }

    // метод: открываем вкладку для практики Murder-Mystery
  async createMMTab() {
    const fileName = "SQL Murder Mystery.md";
    const file = this.app.vault.getAbstractFileByPath(fileName);

    if (file) {
      const leaf = this.app.workspace.splitActiveLeaf();
      await leaf.openFile(file);
    } else {
      const startText = `
\`\`\`
Both a self-directed lesson to learn SQL concepts and fun game for experienced SQL users to solve an intriguing crime!!

A crime has taken place and the detective needs your help. The detective gave you the crime scene report but you somehow lost it. You vaguely remember that the crime was a ​murder​ that occurred sometime on ​Jan.15, 2018​ and that it took place in ​SQL City​. Start by retrieving the corresponding crime scene report from the police department’s database.
\`\`\`

# Exploring the Database Structure

Experienced SQL users can often use database queries to infer the structure of a database. But each database system has different ways of managing this information. The SQL Murder Mystery in Obsidian uses **PostgreSQL**. After connecting to the database, use various commands!

# Start your investigation right now!!

— Write an SQL query (use PostgreSQL syntax!) and highlight the query. By clicking on the hotkey (defined in the settings) you will get the result.

— As you investigate, study the tables, take notes, and write suspects right here!

— If you want to learn and study some commands, use the hotkey and the instructions will be opened.

*There are a lot of suspects! We recommend limiting requests to 10-30 people. Good luck!*
* If you want to check your assumption, press ctrl+0 and enter the answer! 
___________________________________________________________________________
`;

      const newFile = await this.app.vault.create(fileName, startText);
      const leaf = this.app.workspace.splitActiveLeaf();
      await leaf.openFile(newFile);
    }
  }

  // метод для открытия модального окна для ввода ответа
  openMurderMysteryModal() {
    const modal = new MurderMysteryModal(this.app);
    modal.open();
  }

  onunload() {
    console.log("Plugin was onloaded");
  }
}

// само модальное окно для "Murder Mystery"
class MurderMysteryModal extends Modal {
  onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.createEl("h2", { text: "Murder Mystery" });

    const inputContainer = contentEl.createDiv();
    const inputField = inputContainer.createEl("input", {
      attr: { type: "text", placeholder: "Enter the name..." }
    });

    const submitBtn = contentEl.createEl("button", { text: "Submit" });
    submitBtn.addEventListener("click", () => this.checkAnswer(inputField.value));
  }

  // проверка правильности введенного ответа
  checkAnswer(answer) {
    const correctAnswer = "Miranda Priestly";
    if (answer === correctAnswer) {
      new Notice("Congratulations! It is a correct answer!");
    } else {
      new Notice("Not correct. Try one more time!");
    }
    this.close();
  }
}

// класс для модального окна с результатом выполнения SQL-запроса
class SQLResultModal extends Modal {
  constructor(app, result, button) {
    super(app);
    this.result = result;
    this.button = button;
  }

  // метод, вызываемый при открытии модального окна -- внутри просто обработка действий внутри окна
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "Result of the query" });

    const resultContainer = contentEl.createDiv({ cls: "sql-modal-result" });
    resultContainer.innerHTML = this.result;

    const buttonContainer = contentEl.createDiv({ cls: "sql-modal-buttons" });

    const insertBtn = buttonContainer.createEl("button", { text: "Insert" });
    insertBtn.addEventListener("click", () => {
      this.insertResult();
      this.close();
    });
  }

   // метод для вставки результата в редактор
  insertResult() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf && activeLeaf.view.getViewType() === "markdown") {
      const editor = activeLeaf.view.editor;
      editor.replaceSelection(`Result of the query:\n${this.result}\n`);
    }
  }
}
