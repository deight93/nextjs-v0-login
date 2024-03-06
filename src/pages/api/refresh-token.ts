import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let client;
  let userData;

  try {
    let result;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = (req.headers.authorization || '').split("Bearer ").at(1)

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token not provided' });
    }

    client = await pool.connect();
    if (req.method === 'GET') {
      const decoded = await jwt.verify(token, jwtSecretKey!) as JwtPayload;
      const userId = decoded.id;

      const query = `SELECT * FROM nextjs_user WHERE id = '${userId}'`;
      result = await client.query(query);
      userData = await result.rows[0]
    }

    if (!userData) {
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
