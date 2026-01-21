'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const assignSchema = z.object({
    teacherId: z.string().min(1, 'Please select a teacher'),
    subjectId: z.string().min(1, 'Please select a subject'),
    sectionId: z.string().min(1, 'Please select a section'),
})

// === Section Actions ===
const sectionSchema = z.object({
    name: z.string().min(1, 'Section name required'),
    semester: z.string().min(1, 'Semester required'),
})

export async function createSection(formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = sectionSchema.safeParse(data)

    if (!parsed.success) return { error: 'Invalid data' }

    try {
        await prisma.section.create({ data: parsed.data })
        revalidatePath('/admin/students')
        revalidatePath('/admin/assignments')
        return { success: true }
    } catch (e) {
        return { error: 'Error creating section' }
    }
}

// === Assignment Actions ===

export async function assignTeacher(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData)
    const result = assignSchema.safeParse(data)

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    const { teacherId, subjectId, sectionId } = result.data

    try {
        // Check for duplicates
        const existing = await prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId,
                sectionId
            }
        })

        if (existing) {
            return { errors: { _form: ['This teacher is already assigned to this subject for this section.'] } }
        }

        await prisma.teacherSubject.create({
            data: {
                teacherId,
                subjectId,
                sectionId
            }
        })
        revalidatePath('/admin/assignments')
        return { success: true }
    } catch (e) {
        return { errors: { _form: ['Assignment failed due to a database error.'] } }
    }
}

export async function createSubject(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    if (!name || name.length < 2) return { errors: { name: ['Subject name too short'] } }

    try {
        await prisma.subject.create({ data: { name } })
        revalidatePath('/admin/assignments')
        return { success: true }
    } catch (e) {
        return { errors: { _form: ['Error creating subject'] } }
    }
}
