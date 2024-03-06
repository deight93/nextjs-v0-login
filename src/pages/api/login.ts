import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

const bcrypt = require('bcryptjs');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let client;
  let result;
  let isValidPassword;
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    // 데이터베이스 연결
    client = await pool.connect();
    if (req.method === 'POST') {
      const { email, password } = req.body;
      const query = `SELECT * FROM nextjs_user WHERE email = '${email}'`;

      result = await client.query(query);
      const hashedPassword = await result.rows[0].password
      isValidPassword = await bcrypt.compare(password, hashedPassword);
    } 
    
    if (!isValidPassword) {
        res.status(400).json({ success: false, data: null });
    } else {
        const token = jwt.sign({ id: result.rows[0].id }, jwtSecretKey!, { expiresIn: '600s' });
        const verified = jwt.verify(token, jwtSecretKey!);
        const decodedToken: any = jwt.decode(token);
        const expirationTime = decodedToken ? decodedToken.exp * 1000 : 0;
        res.status(200).json({ success: true, data: token, exp: expirationTime });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}
