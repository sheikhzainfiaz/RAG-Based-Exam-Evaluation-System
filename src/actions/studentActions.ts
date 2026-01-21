'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const studentSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    sectionId: z.string().optional(),
})

export async function createStudent(formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = studentSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid data' }
    }

    try {
        const { sectionId, ...userData } = parsed.data
        await prisma.user.create({
            data: {
                ...userData,
                role: 'STUDENT',
                studentSectionId: sectionId && sectionId.length > 0 ? sectionId : null,
            },
        })
        revalidatePath('/admin/students')
        return { success: true }
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'Error creating student' }
    }
}
