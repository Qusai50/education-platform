require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
const { z } = require('zod');

const app = express();
app.use(morgan('combined'));
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const PROGRAMS = ['cybersecurity', 'networks', 'programming'];

const studentSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير').max(100, 'الاسم طويل'),
});

// تسجيل طالب: يرجع رمز خاص به
app.post('/api/students', async (req, res) => {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  try {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      'INSERT INTO students (name, token) VALUES ($1, $2)',
      [parsed.data.name, token]
    );
    console.log('New student registered at', new Date().toISOString());
    res.status(201).json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل حفظ الاسم' });
  }
});

// دخول طالب إلى تخصص
app.post('/api/programs/:slug/enter', async (req, res) => {
  const slug = req.params.slug;
  if (!PROGRAMS.includes(slug)) {
    return res.status(404).json({ error: 'التخصص غير موجود' });
  }
  const token = req.get('x-student-token');
  if (!token || token.length !== 64) {
    return res.status(401).json({ error: 'سجّل اسمك أولاً' });
  }
  try {
    const student = await pool.query(
      'SELECT id, name FROM students WHERE token = $1',
      [token]
    );
    if (student.rowCount === 0) {
      return res.status(401).json({ error: 'سجّل اسمك أولاً' });
    }
    const { id, name } = student.rows[0];
    await pool.query(
      `INSERT INTO program_entries (student_id, program)
       VALUES ($1, $2)
       ON CONFLICT (student_id, program)
       DO UPDATE SET visits = program_entries.visits + 1,
                     last_entered_at = NOW()`,
      [id, slug]
    );
    res.json({ ok: true, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل تسجيل الدخول للتخصص' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));