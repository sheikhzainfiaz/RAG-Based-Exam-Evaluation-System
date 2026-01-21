import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function StudentDashboard() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')
    const user = JSON.parse(session)

    if (!user.studentSectionId) {
        return <div className="p-8 text-center text-gray-400">You are not assigned to any section yet.</div>
    }

    // 1. Completed Exams
    const completedCount = await prisma.result.count({
        where: { studentId: user.id }
    })

    // 2. Total Exams Assigned to my Section
    // (Exams are linked to a Subject, but we filter by Section)
    // Actually schema says Exam -> Section directly.
    const totalAssignedExams = await prisma.exam.count({
        where: { sectionId: user.studentSectionId }
    })

    // 3. Pending Exams
    const pendingCount = Math.max(0, totalAssignedExams - completedCount)

    // 4. Calculating Average Score (if any)
    const results = await prisma.result.findMany({
        where: { studentId: user.id },
        select: { score: true, totalScore: true }
    })

    let averagePercentage = 0
    if (results.length > 0) {
        const totalPercentage = results.reduce((acc, curr) => {
            return acc + ((curr.score / curr.totalScore) * 100)
        }, 0)
        averagePercentage = totalPercentage / results.length
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">View upcoming exams and check your performance.</p>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Pending Exams</h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-500">{pendingCount}</p>
                </div>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Completed Exams</h3>
                    <p className="mt-2 text-3xl font-bold text-green-500">{completedCount}</p>
                </div>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Average Score</h3>
                    <p className="mt-2 text-3xl font-bold text-pink-500">
                        {results.length > 0 ? `${averagePercentage.toFixed(1)}%` : '--'}
                    </p>
                </div>
            </div>

            {/* Recent Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/student/exams" className="block premium-card hover:bg-accent/50">
                    <h3 className="font-bold text-foreground mb-2">Take an Exam &rarr;</h3>
                    <p className="text-sm text-muted-foreground">Browse available exams for your section and start taking them.</p>
                </Link>
                <Link href="/student/results" className="block premium-card hover:bg-accent/50">
                    <h3 className="font-bold text-foreground mb-2">View History &rarr;</h3>
                    <p className="text-sm text-muted-foreground">Check your past grades and performance analysis.</p>
                </Link>
            </div>
        </div>
    )
}
