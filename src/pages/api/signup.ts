import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

const bcrypt = require('bcryptjs');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let client;
  let result;

  // 해시 비교 함수
  // console.log(hashedPassword);
  // const isValidPassword = await bcrypt.compare("1234", hashedPassword);
  // console.log(isValidPassword);

  try {
    // 데이터베이스 연결
    client = await pool.connect();
    if (req.method === 'POST') {
      const { firstName, lastName, email, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const query = 'INSERT INTO nextjs_user (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)';
      const values = [firstName, lastName, email, hashedPassword];
      result = await client.query(query, values);

    } else if (req.method === 'GET') {
      const { email } = req.query;
      result = await client.query(`SELECT EXISTS (SELECT 1 FROM nextjs_user WHERE email = '${email}') AS condition_exists`);
      result = result.rows[0].condition_exists
    }
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}
