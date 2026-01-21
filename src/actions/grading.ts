'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveManualGrades(resultId: string, formData: FormData) {
    const result = await prisma.result.findUnique({
        where: { id: resultId },
        include: { answers: true }
    })

    if (!result) return { error: 'Result not found' }

    let totalScore = 0;

    // Iterate through submitted form data to find scores for each answer
    // Expected format: score-{answerId}
    const updatePromises = result.answers.map(async (ans) => {
        const fieldName = `score-${ans.id}`
        const rawScore = formData.get(fieldName)

        if (rawScore !== null) {
            const score = parseFloat(rawScore as string)
            totalScore += score

            return prisma.answer.update({
                where: { id: ans.id },
                data: { marksObtained: score }
            })
        }
        // If not in form, keep existing score (or 0 if null)
        const currentScore = ans.marksObtained || 0
        totalScore += currentScore
        return Promise.resolve()
    })

    try {
        await Promise.all(updatePromises)

        // Update Result final status
        await prisma.result.update({
            where: { id: resultId },
            data: {
                score: totalScore,
                status: 'GRADED'
            }
        })

        revalidatePath('/teacher/results')
    } catch (e) {
        console.error("Grading Error:", e)
        return { error: 'Failed to save grades' }
    }

    redirect('/teacher/results')
}
