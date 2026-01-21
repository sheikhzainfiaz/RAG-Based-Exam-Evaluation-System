import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function StudentExamsPage() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const user = JSON.parse(session || '{}')

    // Get student's section
    const student = await prisma.user.findUnique({
        where: { id: user.id },
        include: { studentSection: true }
    })

    if (!student?.studentSectionId) {
        return <div className="text-white">You are not assigned to any section.</div>
    }

    // Get exams for this section
    const exams = await prisma.exam.findMany({
        where: { sectionId: student.studentSectionId },
        include: { subject: true, _count: { select: { questions: true } } },
        orderBy: { createdAt: 'desc' }
    })

    // Check which exams are already taken
    const results = await prisma.result.findMany({
        where: { studentId: user.id },
        select: { examId: true }
    })
    const takenExamIds = new Set(results.map(r => r.examId))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Available Exams</h1>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-gray-200 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 pl-6">Exam Title</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Questions</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No exams available for your section.</td>
                                </tr>
                            ) : (
                                exams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 pl-6 text-white font-medium text-base">{exam.title}</td>
                                        <td className="p-4 text-purple-300">{exam.subject.name}</td>
                                        <td className="p-4">{exam.duration} mins</td>
                                        <td className="p-4">{exam._count.questions}</td>
                                        <td className="p-4 text-right pr-6">
                                            {takenExamIds.has(exam.id) ? (
                                                <span className="text-gray-500 italic">Completed</span>
                                            ) : (
                                                <Link href={`/student/exams/${exam.id}`}>
                                                    <Button className="bg-indigo-600 hover:bg-indigo-500 h-8 text-xs">Start Exam</Button>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
