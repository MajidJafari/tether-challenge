const jwt = require('jsonwebtoken');

class AuthenticationController {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  async login(req) {
    const { username, password } = req;

    // For simplicity, we're hardcoding a single user. Replace with proper user validation logic.
    if (username !== 'admin' || password !== 'password') {
      throw new Error('Invalid username or password.');
    }

    const payload = {
      id: 1,
      username: 'admin',
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' }); // Token valid for 1 hour
    return { token };
  }
}

module.exports = AuthenticationController;
