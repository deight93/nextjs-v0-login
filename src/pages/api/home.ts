import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let client;

  try {
    let result;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = (req.headers.authorization || '').split("Bearer ").at(1)

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token not provided' });
    }
    const decoded = await jwt.verify(token, jwtSecretKey!) as JwtPayload;
    const userId = decoded.id;

    // 데이터베이스 연결
    if (req.method === 'GET') {
      client = await pool.connect();
      const expirationTime = decoded.exp;
      const query = `SELECT email, first_name, last_name FROM nextjs_user WHERE id = '${userId}'`;
      result = await client.query(query);
      const data = await result.rows[0]

      res.status(200).json({ success: true, data: data, exp: expirationTime });
    } else if (req.method === 'POST') {
      client = await pool.connect();
      const query = 'UPDATE user_token SET token = $1 WHERE nextjs_user_id = $2';
      const values = [null, userId];
      await client.query(query, values);
      
      res.status(200).json({ success: true, data: true });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}
