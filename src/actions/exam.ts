'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { cookies } from 'next/headers'

const questionSchema = z.object({
    text: z.string().min(5, "Question text must be at least 5 characters"),
    options: z.string(),
    correctAnswer: z.string().min(1, "Correct answer is required"),
})

const examSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    assignment_ref: z.string().refine(val => val.includes('|'), "Please select a valid class"),
    duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
    questions: z.array(questionSchema).min(1, "At least one question is required"),
})

export type ExamState = {
    errors?: {
        title?: string[];
        duration?: string[];
        assignment_ref?: string[];
        questions?: string[]; // General question errors
        _form?: string[];
    };
    success?: boolean;
}

export async function createExam(prevState: ExamState, formData: FormData): Promise<ExamState> {
    // 1. Extract Questions dynamic keys
    const entries = Array.from(formData.entries())
    const questionsMap = new Map()

    entries.forEach(([key, value]) => {
        // Expected format: question-0-text
        if (key.startsWith('question-')) {
            const parts = key.split('-')
            if (parts.length >= 3) {
                const index = parts[1]
                const field = parts[2] // text, correctAnswer, etc.

                if (!questionsMap.has(index)) {
                    questionsMap.set(index, {})
                }
                questionsMap.get(index)[field] = value
            }
        }
        // Also capture options: question-0-opt-0, question-0-opt-1, etc.
        // But my previous component sent question-0-opt1
    })

    // 2. Construct Question Objects
    const questions = Array.from(questionsMap.values()).map(q => {
        // Validate options presence
        const options = [q.opt1, q.opt2, q.opt3, q.opt4].filter(Boolean)

        // If correct answer matches an option LABEL (e.g. "Option 1"), we might want to store value. 
        // For now, assuming user types the value.

        return {
            text: q.text,
            options: JSON.stringify(options),
            correctAnswer: q.correctAnswer
        }
    })

    // 3. Construct Raw Data Payload
    const rawData = {
        title: formData.get('title'),
        duration: formData.get('duration'),
        assignment_ref: formData.get('assignment_ref'), // "subjectId|sectionId"
        questions
    }

    // 4. Validate
    const validated = examSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors
        }
    }

    const { title, duration, assignment_ref, questions: validQuestions } = validated.data
    const [subjectId, sectionId] = assignment_ref.split('|')

    // 5. Auth Check
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return { errors: { _form: ['Unauthorized'] } }
    const user = JSON.parse(session)

    try {
        await prisma.exam.create({
            data: {
                title,
                subjectId,
                sectionId,
                duration,
                date: new Date(), // Defaulting to now satisfying strict schema requirement
                creatorId: user.id,
                questions: {
                    create: validQuestions.map(q => ({
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer
                    }))
                }
            }
        })

        revalidatePath('/teacher/exams')
        return { success: true }
    } catch (e) {
        console.error("Create Exam Error:", e)
        return { errors: { _form: ['Database error: Failed to create exam'] } }
    }
}
