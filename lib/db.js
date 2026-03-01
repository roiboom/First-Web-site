// Database initialization and schema setup using better-sqlite3
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

const DB_PATH = path.join(process.cwd(), 'data', 'portal.db');

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      full_name TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      two_factor_secret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Run migrations
    BEGIN TRANSACTION;
    -- Try to add the column, it will silently fail if it already exists because of ignore errors hack in sqlite,
    -- but a safer approach in node-sqlite3/better-sqlite3 is to check pragma table_info
    COMMIT;
  `);

  const tableInfo = db.pragma("table_info(users)");
  const hasTwoFactor = tableInfo.some(col => col.name === 'two_factor_secret');
  if (!hasTwoFactor) {
    db.exec("ALTER TABLE users ADD COLUMN two_factor_secret TEXT;");
  }

  db.exec(`
  --Students extended info
    CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    phone TEXT,
    address TEXT,
    class_name TEXT DEFAULT 'Class A',
    enrollment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    parent_name TEXT,
    parent_phone TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  --Teachers extended info
    CREATE TABLE IF NOT EXISTS teachers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    teacher_id TEXT UNIQUE NOT NULL,
    subject TEXT,
    phone TEXT,
    department TEXT DEFAULT 'General',
    hire_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  --Grades
    CREATE TABLE IF NOT EXISTS grades(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER,
    subject TEXT NOT NULL,
    grade REAL NOT NULL,
    max_grade REAL DEFAULT 100,
    term TEXT DEFAULT 'Term 1',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  );

  --Attendance
    CREATE TABLE IF NOT EXISTS attendance(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN('present', 'absent', 'late', 'excused')),
    recorded_by INTEGER,
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(recorded_by) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE(student_id, date)
  );

  --Messages
    CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER,
    recipient_role TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    is_announcement INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  --Schedule
    CREATE TABLE IF NOT EXISTS schedules(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id INTEGER,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  );
  `);
}


