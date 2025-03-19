const express = require("express"); //модуль для создания сервера
const { Client } = require("pg"); //модуль pg для работы с PostgreSQL
const cors = require("cors"); //модуль cors для обработки CORS-запросов

const app = express();
const PORT = 3000; //порт, на котором будет работать сервер

//поддержка CORS , json
app.use(cors());
app.use(express.json());

// создаем клиент для подключения к PostgreSQL
// данные пользователя! 
const client = new Client({
  user: "username", 
  host: "localhost",
  database: "database_name",
  password: "password",
  port: 5432,
});

// подключаемся к бд, + в логи выводим успешное подключение
client.connect().then(() => console.log("succesfully connected to PostgreSQL"));

// обработка гет запроса для получения списка таблиц
app.get("/tables", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    res.json(result.rows.map(row => row.table_name));
  }
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error of the server");
  }
});

//  выполнения SQL-запросов
app.post("/query", async (req, res) => {
  const { sql } = req.body;

  if (!sql) {   // проверяем, что SQL-запрос передан
    return res.status(400).json({ error: "There is no SQL-query" });
  }

  try {
    const result = await client.query(sql);
    res.json(result.rows);
  } 
  catch (error) {
    console.error("An error occurred while executing the query:", error);
    res.status(500).json({ error: "An error occurred while executing the query" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
