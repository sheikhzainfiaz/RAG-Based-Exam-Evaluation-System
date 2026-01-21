'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function submitExam(examId: string, formData: FormData) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return { error: 'Unauthorized' }
    const user = JSON.parse(session)

    // Fetch the exam questions to grade
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: true }
    })

    if (!exam) return { error: 'Exam not found' }

    let score = 0;
    let totalScore = 0;
    let hasSubjective = false;

    // Use a transaction/batch if needed, but for now simple loop is fine
    // We need to prepare data for Answer creation
    const answersToCreate = [];

    for (const q of exam.questions) {
        const answerText = formData.get(`question-${q.id}`) as string || ''
        const maxMarks = q.marks || 1;
        totalScore += maxMarks;

        let marksObtained: number | null = 0;

        // Check if MCQ
        // Prisma types might not automatically infer 'type' if it wasn't in previous generated client, 
        // but we just pushed DB so it should be fine. 
        // Safe check: (q as any).type
        const qType = (q as any).type || 'MCQ';

        if (qType === 'MCQ') {
            if (q.correctAnswer && answerText && answerText.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                score += maxMarks;
                marksObtained = maxMarks;
            } else {
                marksObtained = 0;
            }
        } else {
            // Subjective
            hasSubjective = true;
            marksObtained = null; // Pending Grading
        }

        answersToCreate.push({
            questionId: q.id,
            answerText: answerText,
            marksObtained: marksObtained
        })
    }

    try {
        await prisma.result.create({
            data: {
                studentId: user.id,
                examId: exam.id,
                score: score,
                totalScore: totalScore,
                status: hasSubjective ? 'PENDING' : 'GRADED',
                answers: {
                    create: answersToCreate
                }
            }
        })
    } catch (e) {
        console.error(e)
        return { error: 'Error submitting exam' }
    }

    revalidatePath('/student/results')
    redirect('/student/results')
}
