import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  // Validacao do token JWT

  // Pegar o Token no Header
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT token is missing', 401);
  }

  // Bearer | Token - Dividir as partes e retornar somente o token
  const [, token] = authHeader.split(' ');

  // Verify - Retorna o Token decodificado
  try {
    const decoded = verify(token, authConfig.jwt.secret);

    // sub = ID do usuario dentro do request.user
    const { sub } = decoded as TokenPayload;
    request.user = {
      id: sub,
    };

    // Agora temos o ID de usuario disponivel em todas as rotas na nossa aplicacao

    return next();
  } catch {
    throw new AppError('Invalid JWT token', 401);
  }
}
