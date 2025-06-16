import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type GetServerSidePropsContext } from 'next'

export const createServerSupabaseClient = (context: GetServerSidePropsContext) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return context.req.cookies[name]
                },
                set(name: string, value: string, options: CookieOptions) {
                    context.res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`)
                },
                remove(name: string, options: CookieOptions) {
                    context.res.setHeader('Set-Cookie', `${name}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; SameSite=${options.sameSite}; Secure=${options.secure}`)
                },
            },
        }
    )
} 