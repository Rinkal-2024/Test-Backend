import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../entities/userModel";
import { AppDataSource } from "../datasource";
import nodemailer from "nodemailer";
import { UserRole } from "../enumerations/userRole";

const userRepository = AppDataSource.getRepository(User);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

function sendVerificationEmail(email: string, verificationCode: string) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    text: `Your verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const newUser = new User();
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.role = UserRole.CUSTOMER;
    newUser.verificationCode = verificationCode;

    await userRepository.save(newUser);
    sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message:
        "Customer registration successful. Check your email for verification.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationCode = Math.floor(Math.random() * 1000000).toString();

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = hashedPassword;
  user.role = UserRole.ADMIN;
  user.verificationCode = verificationCode;

  await userRepository.save(user);

  sendVerificationEmail(email, verificationCode);

  res.status(200).json({
    message:
      "Registration successful. Please check your email to verify your account.",
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

    if (user.verificationCode === code) {
      user.isVerified = true;
      await userRepository.save(user);
      res.status(200).json({ message: "Email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "Email not verified" });
    }

    if (user.role === UserRole.CUSTOMER) {
       res.status(400).json({ message: "You are not allowed to login from here" });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
