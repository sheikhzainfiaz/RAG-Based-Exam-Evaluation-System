'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { error: 'Invalid input' }
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user || user.password !== password) {
        return { error: 'Invalid credentials' }
    }

    // Create session
    const sessionData = JSON.stringify({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        studentSectionId: user.studentSectionId
    })

    const cookieStore = await cookies()
    cookieStore.set('session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    // Redirect based on role
    if (user.role === 'ADMIN') {
        redirect('/admin')
    } else if (user.role === 'TEACHER') {
        redirect('/teacher')
    } else {
        redirect('/student')
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}
