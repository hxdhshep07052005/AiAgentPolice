import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // For demo: token format is "demo-token-{userId}"
      if (token.startsWith('demo-token-')) {
        const userId = token.substring(11);
        req['user'] = { id: userId, role: this.getRoleFromToken(token) };
      }
    }
    
    // Also check for userId in query (for demo simplicity)
    if (req.query.userId) {
      req['user'] = { id: req.query.userId as string, role: this.getRoleFromId(req.query.userId as string) };
    }

    next();
  }

  private getRoleFromToken(token: string): string {
    // This is a simplified version - in production, use proper JWT
    return 'can-bo';
  }

  private getRoleFromId(userId: string): string {
    // Map user IDs to roles for demo
    const roleMap: Record<string, string> = {
      'admin-1': 'quan-tri',
      'ong-a': 'lanh-dao',
      'anh-b': 'can-bo',
      'anh-c': 'can-bo',
    };
    return roleMap[userId] || 'can-bo';
  }
}
