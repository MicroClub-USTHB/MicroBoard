import { z } from "zod"

const envSchema = z.object({
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        EMAIL_SERVER: z.string(),
        NEXTAUTH_SECRET: z.string(),
        EMAIL_FROM: z.string(),
        DISCORD_CLIENT_SECRET: z.string(),
        // GOOGLE_API_KEY: z.string(),
        DISCORD_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        GOOGLE_CLIENT_ID: z.string(),
    })
    // You can't destruct `process.env` as a regular object, so you have to do it manually here.
export const env = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    EMAIL_FROM: process.env.EMAIL_FROM,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
})