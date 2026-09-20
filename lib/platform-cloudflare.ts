import { env } from 'cloudflare:workers';
export function runtime(): Record<string, any> { return env as unknown as Record<string, any>; }

export const runtimeKind: string = 'cloudflare';
