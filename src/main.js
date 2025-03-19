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

  onunload() {
    console.log("Plugin was onloaded");
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
