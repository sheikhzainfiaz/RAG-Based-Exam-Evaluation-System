import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all "Pending" results (for N8N to pick up and grade)
export async function GET(req: NextRequest) {
    try {
        // You might want to add an API Key check here for security
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.API_SECRET}`) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

        const pendingResults = await prisma.result.findMany({
            where: { status: 'PENDING' },
            include: {
                student: {
                    select: { name: true, email: true }
                },
                exam: {
                    select: { title: true, subject: { select: { name: true } } }
                },
                answers: true // Include the text answers
            }
        })

        return NextResponse.json(pendingResults)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }
}

// POST: Update a result (for N8N to write back grades)
export async function POST(req: NextRequest) {
    try {
        let body = await req.json()

        // Handle array wrapper from N8N
        if (Array.isArray(body)) {
            body = body[0]
        }

        const { resultId, gradedAnswers, finalScore } = body

        if (!resultId || !gradedAnswers) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        // update answers
        // We'll assume gradedAnswers is an array of { id: answerId, score: number }
        for (const ans of gradedAnswers) {
            await prisma.answer.update({
                where: { id: ans.id },
                data: { marksObtained: ans.score }
            })
        }

        // update result final score and status
        await prisma.result.update({
            where: { id: resultId },
            data: {
                score: finalScore,
                status: 'GRADED'
            }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
