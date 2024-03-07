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
      const query = `SELECT nextjs_user.*, user_token.nextjs_user_id, user_token.token
                      FROM nextjs_user
                      LEFT JOIN user_token ON nextjs_user.id = user_token.nextjs_user_id
                      WHERE nextjs_user.email = '${email}';`;

      result = await client.query(query);
      const hashedPassword = await result.rows[0].password
      isValidPassword = await bcrypt.compare(password, hashedPassword);
    } 
    
    if (!isValidPassword) {
        res.status(400).json({ success: false, error: "INVALID_PASSWORD" });
    } 

    const token = jwt.sign({ id: result.rows[0].id }, jwtSecretKey!, { expiresIn: '10s' });
    const verified = jwt.verify(token, jwtSecretKey!);
    const decodedToken: any = jwt.decode(token);
    const expirationTime = decodedToken ? decodedToken.exp * 1000 : 0;
    const storedToken = await result.rows[0].token
    const userId = await result.rows[0].id
    const nextjsUserId = result.rows[0].nextjs_user_id

    if (storedToken) {
      try {
        const verified = jwt.verify(storedToken, jwtSecretKey!);
        res.status(400).json({ success: false, error: "ALREADY_LOGIN" });
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          const query = 'UPDATE user_token SET token = $1 WHERE nextjs_user_id = $2';
          const values = [token, userId];
          await client.query(query, values);
        }
      }
    } else if (!storedToken && nextjsUserId) {
      const query = 'UPDATE user_token SET token = $1 WHERE nextjs_user_id = $2';
      const values = [token, userId];
      await client.query(query, values);
    } else {
      const query = 'INSERT INTO user_token (token, nextjs_user_id) VALUES ($1, $2)';
      const values = [token, userId];
      await client.query(query, values);
    }
    res.status(200).json({ success: true, data: token, exp: expirationTime });
    
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}
