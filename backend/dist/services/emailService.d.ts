export type PasswordResetEmailPayload = {
    email: string;
    resetToken: string;
};
export type VerificationEmailPayload = {
    email: string;
    otp: string;
    name?: string;
};
export declare const sendPasswordResetEmail: (email: string, resetToken: string) => Promise<void>;
export declare const sendVerificationEmail: (email: string, otp: string, name?: string) => Promise<void>;
//# sourceMappingURL=emailService.d.ts.map