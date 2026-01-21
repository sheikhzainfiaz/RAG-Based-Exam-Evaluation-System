import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { saveManualGrades } from '@/actions/grading'

export default async function ManualGradingPage({ params }: { params: { id: string } }) {
    const { id } = await params

    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')

    const result = await prisma.result.findUnique({
        where: { id },
        include: {
            student: true,
            exam: {
                include: { questions: true }
            },
            answers: true
        }
    })

    if (!result) notFound()

    const submitAction = saveManualGrades.bind(null, result.id)

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <div className="border-b border-white/10 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Grading: {result.student.name}</h1>
                    <p className="text-gray-400">{result.exam.title} • {new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">Current Score</div>
                    <div className="text-3xl font-mono text-green-400">{result.score || 0} <span className="text-gray-600 text-lg">/ {result.totalScore}</span></div>
                </div>
            </div>

            <form action={submitAction} className="space-y-12">
                {result.exam.questions.map((q, idx) => {
                    const answer = result.answers.find(a => a.questionId === q.id)
                    const studentText = answer?.answerText || "No answer provided"
                    const currentScore = answer?.marksObtained ?? 0

                    // Determine formatting based on question type
                    const isSubjective = !q.type || q.type !== 'MCQ'
                    const borderColor = isSubjective ? 'border-indigo-500/30' : 'border-white/10'

                    return (
                        <div key={q.id} className={`bg-white/5 rounded-2xl border ${borderColor} p-6 space-y-4`}>
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-lg font-medium text-white flex-1">
                                    <span className="text-gray-500 mr-2">{idx + 1}.</span> {q.text}
                                </h3>
                                <div className="bg-black/40 rounded-lg p-2 flex items-center gap-2 border border-white/10">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Marks</span>
                                    <input
                                        type="number"
                                        name={`score-${answer?.id}`}
                                        defaultValue={currentScore}
                                        min={0}
                                        max={q.marks || 10}
                                        step={0.5}
                                        className="w-16 bg-transparent text-right font-mono text-white outline-none focus:text-indigo-400 font-bold"
                                    />
                                    <span className="text-gray-600">/ {q.marks}</span>
                                </div>
                            </div>

                            {/* Answer Section */}
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Student Answer</label>
                                    <div className={`p-4 rounded-lg text-gray-200 text-sm whitespace-pre-wrap ${isSubjective ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-black/30'}`}>
                                        {studentText}
                                    </div>
                                </div>
                                {q.correctAnswer && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Expected Answer</label>
                                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10 text-gray-300 text-sm">
                                            {q.correctAnswer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="sticky bottom-6 flex justify-end">
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex gap-4 items-center">
                        <span className="text-gray-400 text-sm">Review all marks before saving.</span>
                        <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 h-12 text-lg font-bold shadow-lg shadow-green-900/20">
                            Finalize & Save Grades
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
