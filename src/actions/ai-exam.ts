'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { cookies } from 'next/headers'

const questionSchema = z.object({
    q_title: z.string().min(1, 'Question text missing'),
    q_type: z.string().min(1, 'Question type missing'),
})

const saveAiExamSchema = z.object({
    title: z.string().min(1, 'Title required'),
    assignment_ref: z.string().min(1, 'Class required'),
    duration: z.coerce.number().min(5, 'Duration must be at least 5 mins'),
    questions: z.array(questionSchema).min(1, 'No questions to save'),
})

export async function saveAiExam(prevState: any, formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        duration: formData.get('duration'),
        assignment_ref: formData.get('assignment_ref'),
        questions: []
    }

    console.log("Saving AI Exam - Raw Data:", { ...rawData, questions: '...' })

    const questionsJson = formData.get('questions_json') as string
    if (questionsJson) {
        try {
            rawData.questions = JSON.parse(questionsJson)
            console.log("Parsed Questions Count:", rawData.questions.length)
        } catch (e) {
            console.error("JSON Parse Error:", e)
            return { error: 'Failed to parse questions JSON' }
        }
    } else {
        console.error("No questions_json found in formData")
    }

    const validated = saveAiExamSchema.safeParse(rawData)

    if (!validated.success) {
        const errors = validated.error.flatten()
        console.error("Validation Errors:", errors)

        let errorMsg = 'Invalid data'
        if (errors.fieldErrors.questions) errorMsg = errors.fieldErrors.questions[0]
        else if (errors.fieldErrors.title) errorMsg = errors.fieldErrors.title[0]
        else if (errors.fieldErrors.assignment_ref) errorMsg = "Class selection required"

        return { error: errorMsg, details: errors }
    }

    const { title, duration, assignment_ref, questions } = validated.data

    // Validate Ref Format
    if (!assignment_ref.includes('|')) {
        return { error: 'Invalid class selection format' }
    }

    const [subjectId, sectionId] = assignment_ref.split('|')

    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return { error: 'Unauthorized' }
    const user = JSON.parse(session)

    try {
        console.log("Inserting into DB...")
        const exam = await prisma.exam.create({
            data: {
                title,
                subjectId,
                sectionId,
                duration,
                date: new Date(),
                creatorId: user.id,
                questions: {
                    create: questions.map(q => ({
                        text: q.q_title,
                        type: q.q_type.toUpperCase(),
                        marks: q.q_type === 'short' ? 5 : q.q_type === 'long' ? 10 : 5
                    }))
                }
            }
        })
        console.log("Exam Created:", exam.id)

        revalidatePath('/teacher/exams')
        return { success: true }
    } catch (e: any) {
        console.error("DB Insert Error:", e)
        return { error: `Database error: ${e.message}` }
    }
}
