const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor(secret) {
    if (!secret) {
      throw new Error('AuthMiddleware requires a secret key.');
    }
    this.secret = secret;
  }

  /**
   * Middleware function to validate a JWT token.
   * @param {Object} req - The request payload.
   * @throws Will throw an error if authentication fails.
   */
  async validateToken(req) {
    const { token } = req;

    if (!token) {
      return Buffer.from(
        JSON.stringify({
          error: true,
          message: 'Authentication failed. Token is missing.',
          status: 401,
        }),
      );
    }

    try {
      const decoded = jwt.verify(token, this.secret);
      console.log('Authenticated user:', decoded);

      req.user = decoded;
    } catch (error) {
      return Buffer.from(
        JSON.stringify({
          error: true,
          message: 'Authentication failed. Invalid token.',
          status: 401,
        }),
      );
    }
  }
}

module.exports = AuthMiddleware;
