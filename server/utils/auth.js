const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({req}) {
    // allows token to be sent via  req.query, headers or req.body
    let token = req.query.token || req.headers.authorization || req.body.token;

    // ["Bearer", "<tokenvalue>"]. Splits the token string into an array and  returns a token
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }

    // Verify token and get user data from it
    // If the token is verified, add user's data to request so it can be accessed by resolver
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("🚫 Invalid token 🚫");
    }
    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
