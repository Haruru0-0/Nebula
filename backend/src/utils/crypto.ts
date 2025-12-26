import bcrypt from "bcryptjs";
import crypto from "crypto";

const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10");
  return await bcrypt.hash(password, rounds);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

const hashResetToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export { hashPassword, comparePassword, generateResetToken, hashResetToken, generateOTP, hashOTP };
