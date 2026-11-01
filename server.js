require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { Pool } = require('pg');
const { z } = require('zod');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const studentSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير').max(100, 'الاسم طويل'),
});

app.post('/api/students', async (req, res) => {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  try {
    const result = await pool.query(
      'INSERT INTO students (name) VALUES ($1) RETURNING id, name, created_at',
      [parsed.data.name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل حفظ الاسم' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM students ORDER BY id DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل جلب البيانات' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));