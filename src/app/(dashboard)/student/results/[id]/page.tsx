import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'

export default async function ViewResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const user = JSON.parse(session || '{}')

    const result = await prisma.result.findUnique({
        where: { id },
        include: {
            exam: {
                include: {
                    questions: true,
                    subject: true
                }
            },
            answers: true
        }
    })

    if (!result || result.studentId !== user.id) {
        notFound()
    }

    const percentage = (result.score / result.totalScore) * 100
    const isPass = percentage >= 50

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/student/results">
                    <Button variant="ghost" className="hover:bg-accent/50 text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Results
                    </Button>
                </Link>
            </div>

            {/* Score Card */}
            <div className="premium-card p-8 text-center space-y-4">
                <h1 className="text-3xl font-bold text-foreground">{result.exam.title} Results</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-sm">{result.exam.subject.name}</p>

                <div className="flex justify-center items-center gap-12 mt-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Score</p>
                        <p className="text-4xl font-extrabold text-foreground">
                            {result.score} <span className="text-lg text-muted-foreground">/ {result.totalScore}</span>
                        </p>
                    </div>
                    <div className="h-12 w-[1px] bg-border"></div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                        <p className={`text-4xl font-extrabold ${isPass ? 'text-green-500' : 'text-red-500'}`}>
                            {percentage.toFixed(1)}%
                        </p>
                    </div>
                    <div className="h-12 w-[1px] bg-border"></div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${isPass ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isPass ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            {isPass ? 'PASSED' : 'FAILED'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Answers */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground px-1">Detailed Breakdown</h2>

                {result.exam.questions.map((question, index) => {
                    const answer = result.answers.find(a => a.questionId === question.id)
                    const isCorrect = answer?.marksObtained && answer.marksObtained >= question.marks // Basic check, effectively for subjective full marks
                    // For Subjective we might not have a binary "correct", but marks obtained tells the story.

                    const marksObtained = answer?.marksObtained || 0

                    let statusColor = "border-border"
                    if (result.status === 'GRADED') {
                        if (marksObtained === question.marks) statusColor = "border-green-500/50"
                        else if (marksObtained > 0) statusColor = "border-yellow-500/50"
                        else statusColor = "border-red-500/50"
                    }

                    return (
                        <div key={question.id} className={`premium-card p-6 border-l-4 ${statusColor}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg text-foreground flex-1">
                                    <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                                    {question.text}
                                </h3>
                                <div className="text-right pl-4">
                                    <span className="text-sm font-bold text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                                        {marksObtained} / {question.marks} Marks
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-background/50 p-4 rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Your Answer</p>
                                    <p className="text-foreground whitespace-pre-wrap">{answer?.answerText || <span className="text-muted-foreground italic">No answer provided</span>}</p>
                                </div>

                                {question.correctAnswer && (
                                    <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                                        <p className="text-xs text-green-600 dark:text-green-400 mb-1 uppercase font-bold">Correct Answer</p>
                                        <p className="text-foreground">{question.correctAnswer}</p>
                                    </div>
                                )}

                                {question.options && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        {/* Optional: Display MCQ options if needed, but usually redundant if correct answer is shown */}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
