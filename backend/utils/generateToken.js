import jwt from "jsonwebtoken";

const generateToken = (id, sessionVersion = 1) => {
  return jwt.sign({ id, sessionVersion }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
