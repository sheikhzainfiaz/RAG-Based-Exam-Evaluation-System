import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TeacherDashboard() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')
    const user = JSON.parse(session)

    // 1. Total Exams Created by Me
    const examsCount = await prisma.exam.count({
        where: { creatorId: user.id }
    })

    // 2. Pending Grading (Results for my exams where status is pending)
    const pendingCount = await prisma.result.count({
        where: {
            exam: { creatorId: user.id },
            status: 'PENDING'
        }
    })

    // 3. Students Assigned (Approximate via Section enrollments)
    // This is a bit complex as it requires distinct counts across multiple sections.
    // For simplicity, let's just count total enrollments in my classes (TeacherSubject -> Section -> Students)
    const assignments = await prisma.teacherSubject.findMany({
        where: { teacherId: user.id },
        include: { section: { include: { _count: { select: { students: true } } } } }
    })
    const totalStudents = assignments.reduce((acc, curr) => acc + curr.section._count.students, 0)

    // 4. Recent submissions
    const recentResults = await prisma.result.findMany({
        where: { exam: { creatorId: user.id } },
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: { student: true, exam: true }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back. Manage your exams and view student results.</p>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Exams Created</h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-500">{examsCount}</p>
                </div>
                <Link href="/teacher/results" className="block group">
                    <div className="premium-card group-hover:bg-accent/50">
                        <h3 className="text-lg font-medium text-foreground">Pending Grading</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-500">{pendingCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to review assignments</p>
                    </div>
                </Link>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Enrolled Students</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-500">{totalStudents}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card/30 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground">Recent Submissions</h3>
                </div>
                {recentResults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No recent activity.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="p-4 pl-6">Student</th>
                                <th className="p-4">Exam</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentResults.map(r => (
                                <tr key={r.id} className="hover:bg-muted/20">
                                    <td className="p-4 pl-6 text-foreground">{r.student.name}</td>
                                    <td className="p-4 text-muted-foreground">{r.exam.title}</td>
                                    <td className="p-4 text-muted-foreground">{new Date(r.submittedAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        {r.status === 'PENDING' ? (
                                            <span className="text-yellow-600 text-xs font-bold bg-yellow-400/20 px-2 py-1 rounded-full">Pending</span>
                                        ) : (
                                            <span className="text-green-600 text-xs font-bold bg-green-400/20 px-2 py-1 rounded-full">Graded</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
