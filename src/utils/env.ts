import { Credentials } from "@/types"

export const getEnvVar = (key: string): string => {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
    }
    return value
}

export const getEnvVarOptional = (key: string, defaultValue: string = ''): string => {
    return process.env[key] || defaultValue
}

export const ENV = {
    API_KEY: getEnvVar('NEXT_PUBLIC_API_KEY'),
    FIREBASE_CREDENTIALS: JSON.parse(getEnvVar('NEXT_PUBLIC_FIREBASE_CREDENTIALS')) as Credentials,
} as const
