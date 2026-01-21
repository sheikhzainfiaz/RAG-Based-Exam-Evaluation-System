'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['TEACHER', 'STUDENT', 'ADMIN']),
})

export async function createUser(role: 'TEACHER' | 'STUDENT', formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = userSchema.safeParse({ ...data, role })

    if (!parsed.success) {
        return { error: 'Invalid data' }
    }

    try {
        const user = await prisma.user.create({
            data: parsed.data,
        })
        revalidatePath(`/admin/${role.toLowerCase()}s`)
        return { success: true }
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'Error creating user' }
    }
}

export async function deleteUser(id: string) {
    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/teachers')
    revalidatePath('/admin/students')
}
