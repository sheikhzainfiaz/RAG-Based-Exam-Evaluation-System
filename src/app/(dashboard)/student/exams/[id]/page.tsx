import { prisma } from '@/lib/prisma'
import { submitExam } from '@/actions/submission'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function TakeExamPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Check if already taken
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const user = JSON.parse(session || '{}')

    const existingResult = await prisma.result.findFirst({
        where: { examId: id, studentId: user.id }
    })

    if (existingResult) {
        redirect('/student/results')
    }

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            questions: true,
            subject: true
        }
    })

    if (!exam) return <div>Exam not found</div>

    const submitAction = submitExam.bind(null, exam.id)

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div className="border-b border-white/10 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
                <div className="flex gap-4 text-sm text-gray-400">
                    <span>Subject: <span className="text-indigo-400">{exam.subject.name}</span></span>
                    <span>Duration: <span className="text-white">{exam.duration} mins</span></span>
                    <span>Total Questions: <span className="text-white">{exam.questions.length}</span></span>
                </div>
            </div>

            <form action={submitAction} className="space-y-8">
                {exam.questions.map((q, idx) => {
                    // Safe Parse Options for MCQ
                    let options: string[] = []
                    if (q.options) {
                        try {
                            options = JSON.parse(q.options)
                        } catch (e) { /* ignore */ }
                    }

                    // Check Type (Default to MCQ if not set, but handle undefined safely)
                    const isMCQ = !q.type || q.type === 'MCQ'

                    return (
                        <div key={q.id} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-start">
                                <span className="text-gray-500 mr-2 min-w-[24px]">{idx + 1}.</span>
                                <span>{q.text}</span>
                                {q.type && q.type !== 'MCQ' && (
                                    <span className="ml-2 bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold shrink-0 self-start mt-1">
                                        {q.type}
                                    </span>
                                )}
                            </h3>

                            <div className="space-y-3">
                                {isMCQ && options.length > 0 ? (
                                    options.map((opt, i) => (
                                        <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                value={opt}
                                                className="w-4 h-4 text-indigo-600 bg-black/50 border-gray-600 focus:ring-indigo-500 ring-offset-gray-800 focus:ring-2"
                                            />
                                            <span className="text-gray-300 group-hover:text-white">{opt}</span>
                                        </label>
                                    ))
                                ) : (
                                    <textarea
                                        name={`question-${q.id}`}
                                        className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Type your answer here..."
                                    />
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="sticky bottom-4 pt-4">
                    <Button type="submit" className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 shadow-xl shadow-green-900/20">
                        Submit Exam
                    </Button>
                </div>
            </form>
        </div>
    )
}
