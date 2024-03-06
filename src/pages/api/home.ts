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

    // 데이터베이스 연결
    client = await pool.connect();
    if (req.method === 'GET') {
      const decoded = await jwt.verify(token, jwtSecretKey!) as JwtPayload;
      const userId = decoded.id;
      const expirationTime = decoded.exp;

      const query = `SELECT email, first_name, last_name FROM nextjs_user WHERE id = '${userId}'`;
      result = await client.query(query);
      const data = await result.rows[0]
      res.status(200).json({ success: false, data: data, exp: expirationTime });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}
