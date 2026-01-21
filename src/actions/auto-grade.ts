'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function triggerAutoGrading(resultId: string) {
    console.log("Triggering Auto-Grade for:", resultId)

    try {
        // 1. Fetch Full Submission Data
        const result = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                student: true,
                answers: true,
                exam: {
                    include: { questions: true }
                }
            }
        })

        if (!result) return { error: 'Submission not found' }

        // 2. Construct Payload
        const payload = {
            resultId: result.id,
            examId: result.examId,
            studentId: result.studentId,
            studentName: result.student.name,
            studentEmail: result.student.email,
            examTitle: result.exam.title,
            questions: result.answers.map(ans => {
                const originalQ = result.exam.questions.find(q => q.id === ans.questionId)
                return {
                    answerId: ans.id,
                    questionId: ans.questionId,
                    questionText: originalQ?.text || "Unknown Question",
                    maxMarks: originalQ?.marks || 5, // Default if missing
                    studentAnswer: ans.answerText,
                    type: originalQ?.type || 'Subjective'
                }
            })
        }

        console.log("Sending Payload to N8N...", payload.questions.length, "answers")

        // 3. Send to N8N
        // Replace with your actual N8N Webhook URL
        const n8nUrl = "http://localhost:5678/webhook/1f18d0d6-010b-4979-9611-5d3fc521ae65"

        // We use 'no-cors' or simple fetch. 
        // Note: If N8N is on localhost, this fetch happens server-side, so it works fine.
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const responseText = await response.text();
        console.log(`N8N Response: ${response.status} ${response.statusText}`, responseText);

        if (!response.ok) {
            console.error("N8N Webhook Failed:", responseText);
            throw new Error(`N8N Webhook Failed: ${response.statusText}`);
        }

        // Parse N8N Response (Handle Array or Object)
        let gradedData = JSON.parse(responseText);
        if (Array.isArray(gradedData)) {
            gradedData = gradedData[0];
        }

        console.log("Parsed Graded Data:", gradedData);

        if (gradedData && gradedData.gradedAnswers) {
            // Update Answers
            for (const ans of gradedData.gradedAnswers) {
                await prisma.answer.update({
                    where: { id: ans.id },
                    data: { marksObtained: ans.score }
                })
            }

            // Update Result Status
            await prisma.result.update({
                where: { id: gradedData.resultId },
                data: {
                    score: gradedData.finalScore,
                    status: 'GRADED'
                }
            })
            console.log("Database updated successfully from N8N response.");
        } else {
            console.warn("N8N response did not contain expected 'gradedAnswers'.");
        }

        revalidatePath('/teacher/results')
        return { success: true, message: 'Sent to AI Agent for grading' }

    } catch (e: any) {
        console.error("Auto-Grade Error:", e)
        return { error: e.message }
    }
}
