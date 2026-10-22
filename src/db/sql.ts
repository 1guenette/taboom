import * as SQLite from 'expo-sqlite';
import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 0;
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    console.log("=====")
    console.log(result)
    let currentDbVersion = result?.user_version ?? 0;
    // if (currentDbVersion >= DATABASE_VERSION) {
    //     return;
    // }
    // if (currentDbVersion === 3) {
        console.log("+++++++--")
        await db.execAsync(`
            PRAGMA journal_mode = 'wal';
            CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
        `);
        await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'hello', 1);
        await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'world', 2);
        currentDbVersion = 1;
    // }
    // if (currentDbVersion === 1) {
    //   Add more migrations
    // }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getAll() {
    const db = await SQLite.openDatabaseAsync('test.db');
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'hello', 1);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'world', 2);
    return await db.getAllAsync(`SELECT * FROM todos`);
}