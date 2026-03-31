import { getPaginationParams, getPaginationMeta } from '../../src/utils/pagination';
import { hashPassword, comparePassword } from '../../src/utils/bcrypt';
import { generateToken, verifyToken } from '../../src/utils/jwt';

describe('Utils', () => {
  describe('Pagination', () => {
    it('should return correct pagination params', () => {
      const result = getPaginationParams(2, 20);
      expect(result).toEqual({
        page: 2,
        limit: 20,
        skip: 20,
        take: 20,
      });
    });

    it('should handle invalid page numbers', () => {
      const result = getPaginationParams(0, 10);
      expect(result.page).toBe(1);
    });

    it('should handle invalid limit numbers', () => {
      const result = getPaginationParams(1, 200);
      expect(result.limit).toBe(100);
    });

    it('should generate correct pagination meta', () => {
      const meta = getPaginationMeta(95, 2, 10);
      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 95,
        totalPages: 10,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('Bcrypt', () => {
    it('should hash and compare password correctly', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
      const isInvalid = await comparePassword('wrong', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT', () => {
    it('should generate and verify token', () => {
      const payload = { userId: 1, email: 'test@test.com' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });
});