const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const fs = require("fs").promises; // Для работы с файлами
const path = require("path");

const app = express();
const PORT = 3000;

// Поддержка CORS и JSON
app.use(cors());
app.use(express.json());

// Путь к файлу логов
const logFilePath = path.join(__dirname, "sql_queries_log.json");

// Создаем клиент для подключения к PostgreSQL
// данные пользователя! 
const client = new Client({
    user: "username",
    host: "localhost",
    database: "database_name",
    password: "password",
    port: 5432,
});

// Подключаемся к базе данных
client.connect().then(() => console.log("Successfully connected to PostgreSQL"));

// Функция для записи логов
async function logQuery(sql, result, timestamp) {
    const logEntry = JSON.stringify({ sql, result, timestamp: timestamp.toISOString() }) + "\n";

    try {
        await fs.appendFile(logFilePath, logEntry, "utf8");
        console.log(`Запрос "${sql}" записан в лог.`);
    } catch (err) {
        console.error("Ошибка при записи лога:", err);
    }
}

// GET /tables — получение списка таблиц
app.get("/tables", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        );
        res.json(result.rows.map((row) => row.table_name));
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Server error");
    }
});

// POST /query — выполнение SQL-запроса
app.post("/query", async (req, res) => {
    const { sql } = req.body;

    if (!sql) {
        return res.status(400).json({ error: "SQL query is missing" });
    }

    try {
        const timestamp = new Date(); // Фиксируем время выполнения
        const result = await client.query(sql);

        // Логируем запрос
        await logQuery(sql, result.rows, timestamp);

        res.json(result.rows);
    } catch (error) {
        console.error("An error occurred while executing the query:", error);
        res.status(500).json({ error: "An error occurred while executing the query" });
    }
});

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
