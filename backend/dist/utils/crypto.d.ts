declare const hashPassword: (password: string) => Promise<string>;
declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
declare const generateResetToken: () => string;
declare const hashResetToken: (token: string) => string;
declare const generateOTP: () => string;
declare const hashOTP: (otp: string) => string;
export { hashPassword, comparePassword, generateResetToken, hashResetToken, generateOTP, hashOTP };
//# sourceMappingURL=crypto.d.ts.map