import userModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

// ✅ REGISTER (name, phoneNumber, password)
const registerUser = async (req, res) => {
  try {
    const { name, phoneNumber, password ,District} = req.body;

    // check if user exists
    const exist = await userModel.findOne({ phoneNumber });
    if (exist) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validation
    if (!name || !phoneNumber || !password || !District) {
      return res.json({ success: false, message: "All fields required" });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = new userModel({
      name,
      phoneNumber,
      password: hashedPassword,
      District,
    });

    const user = await newUser.save();

    // token
    const token = createToken(user._id);

    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ LOGIN (name + password)
const loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await userModel.findOne({ name });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser };