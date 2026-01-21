import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AutoGradeButton from '@/components/AutoGradeButton'

export default async function TeacherResultsPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')
    const user = JSON.parse(session)

    // 1. Fetch Teacher Assignments for Filter Dropdown
    const assignments = await prisma.teacherSubject.findMany({
        where: { teacherId: user.id },
        include: { subject: true, section: true }
    })

    const { ref } = await searchParams
    let results: any[] = []
    let selectedSubjectId = ''
    let selectedSectionId = ''

    // 2. Fetch Results if Ref Selected
    if (ref) {
        const [subId, secId] = ref.split('|')
        selectedSubjectId = subId
        selectedSectionId = secId

        results = await prisma.result.findMany({
            where: {
                exam: {
                    subjectId: subId,
                    sectionId: secId
                }
            },
            include: {
                student: true,
                exam: true
            },
            orderBy: { submittedAt: 'desc' }
        })
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Exam Results Management</h1>
                    <p className="text-gray-400 mt-1">Select a class to view student performance</p>
                </div>

                {/* Class Selector Description */}
                <div className="text-right">
                    <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {assignments.length} Classes Assigned
                    </span>
                </div>
            </div>

            {/* Class Selection Pills (Server Side Friendly) */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/teacher/results"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!ref ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    All Assignments
                </Link>
                {assignments.map(a => {
                    const val = `${a.subjectId}|${a.sectionId}`
                    const isActive = ref === val
                    return (
                        <Link
                            key={a.id}
                            href={`/teacher/results?ref=${val}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {a.subject.name} - {a.section.semester} {a.section.name}
                        </Link>
                    )
                })}
            </div>

            {!ref ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                    <h3 className="text-xl text-gray-400 font-medium">Please select a class above to view results</h3>
                </div>
            ) : (
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            <tr>
                                <th className="p-4 pl-6">Student</th>
                                <th className="p-4">Exam Title</th>
                                <th className="p-4">Submission Date</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No submissions found for this class yet.
                                    </td>
                                </tr>
                            ) : results.map(r => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="font-medium text-white">{r.student.name}</div>
                                        <div className="text-xs text-gray-500">{r.student.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-300">{r.exam.title}</td>
                                    <td className="p-4 text-gray-400 text-sm">{new Date(r.submittedAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center font-bold text-white">
                                        {r.status === 'PENDING' ? '-' : r.score}
                                        <span className="text-gray-500 font-normal text-xs ml-1">/ {r.totalScore}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {r.status === 'PENDING' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                                Pending Grading
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                                                Graded
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        {r.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                <AutoGradeButton resultId={r.id} />
                                                <Link
                                                    href={`/teacher/results/${r.id}/grade`}
                                                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    Manual
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
