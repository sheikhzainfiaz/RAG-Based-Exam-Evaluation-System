'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors duration-300">
            {/* Glassmorphism Card style adapted for both themes */}
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-foreground">EMS Login</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-center text-sm text-destructive bg-destructive/10 py-2 rounded">
                            {state.error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 text-md font-semibold tracking-wide text-white"
                    >
                        {isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        Demo Credentials: <br />
                        <span className="font-mono text-foreground font-bold">admin@ems.com</span> / <span className="font-mono text-foreground font-bold">password</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
