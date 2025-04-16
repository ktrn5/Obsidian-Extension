const fs = require("fs").promises;

async function analyzeLogs() {
    try {
        // Чтение логов
        const logs = await fs.readFile("./sql_queries_log.json", "utf8");
        const parsedLogs = logs
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => JSON.parse(line));

        // Подготовка данных
        const enrichedLogs = parsedLogs.map((log) => ({
            sql: log.sql,
            query_type: getQueryType(log.sql),
            table_name: getTableName(log.sql),
            hour: new Date(log.timestamp).getHours(),
            day_of_week: new Date(log.timestamp).getDay(),
        }));

        // Классификация запросов
        const queryGroups = classifyQueries(enrichedLogs);
        console.log("Классификация запросов:", queryGroups);

        // Прогнозирование активности
        const predictions = predictActivity(enrichedLogs);
        console.log("Прогнозы активности:", predictions);

        // Обнаружение аномалий
        const anomalies = detectAnomalies(enrichedLogs);
        console.log("Аномалии:", anomalies);

        // Сегментация по таблицам
        const segments = segmentByTables(enrichedLogs);
        console.log("Сегментация по таблицам:", segments);

        // Вывод популярных типов запросов
        const popularQueryTypes = getPopularQueryTypes(enrichedLogs);
        console.log("Самые популярные типы запросов:", popularQueryTypes);
    } catch (err) {
        console.error("Ошибка при чтении логов:", err);
    }
}

// Функция для извлечения типа запроса
function getQueryType(query) {
    const type = query.split(" ")[0].toUpperCase();
    return ["SELECT", "INSERT", "UPDATE", "DELETE"].includes(type) ? type : "OTHER";
}

// Функция для извлечения имени таблицы
function getTableName(query) {
    const match = query.match(/FROM\s+(\w+)/i);
    return match ? match[1] : "unknown";
}

// Классификация запросов
function classifyQueries(logs) {
    const queryGroups = {};
    logs.forEach((log) => {
        const { query_type, table_name } = log;

        if (!queryGroups[table_name]) {
            queryGroups[table_name] = {};
        }

        queryGroups[table_name][query_type] = (queryGroups[table_name][query_type] || 0) + 1;
    });
    return queryGroups;
}

// Прогнозирование активности
function predictActivity(logs) {
    const hourlyCounts = {};
    logs.forEach((log) => {
        const hour = log.hour;
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    const lastHour = Math.max(...Object.keys(hourlyCounts).map(Number));
    const nextHour = (lastHour + 1) % 24; // Прогноз на следующий час
    const prediction = hourlyCounts[lastHour] || 0;

    return { next_hour: nextHour, predicted_count: prediction };
}

// Обнаружение аномалий
function detectAnomalies(logs) {
    const queryCounts = {};
    logs.forEach((log) => {
        const key = `${log.query_type}-${log.table_name}`;
        queryCounts[key] = (queryCounts[key] || 0) + 1;
    });

    const anomalies = Object.entries(queryCounts)
        .filter(([key, count]) => count > 50) // Например, более 50 запросов одного типа к одной таблице
        .map(([key]) => key);

    return anomalies;
}

// Сегментация по таблицам
function segmentByTables(logs) {
    const segments = {};
    logs.forEach((log) => {
        const { table_name, query_type } = log;

        if (!segments[table_name]) {
            segments[table_name] = {};
        }

        segments[table_name][query_type] = (segments[table_name][query_type] || 0) + 1;
    });

    return segments;
}

// Получение популярных типов запросов
function getPopularQueryTypes(logs) {
    const queryTypeCounts = {};

    // Подсчет количества каждого типа запроса
    logs.forEach((log) => {
        const { query_type } = log;
        queryTypeCounts[query_type] = (queryTypeCounts[query_type] || 0) + 1;
    });

    // Сортировка типов запросов по популярности
    const sortedQueryTypes = Object.entries(queryTypeCounts)
        .sort((a, b) => b[1] - a[1]) // Сортировка по убыванию
        .map(([type, count]) => ({ type, count }));

    return sortedQueryTypes;
}

analyzeLogs();