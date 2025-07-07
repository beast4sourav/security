import  Jwt  from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const token = Jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token valid for 30 days
    });

    res.cookie("token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "Strict", // Helps prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
    });
    return token;
   
}