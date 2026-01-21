import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function StudentResultsPage() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const user = JSON.parse(session || '{}')

    const results = await prisma.result.findMany({
        where: { studentId: user.id },
        include: { exam: { include: { subject: true } } },
        orderBy: { submittedAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">My Results</h1>
            </div>

            <div className="premium-card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-muted-foreground">
                        <thead className="bg-muted/50 text-foreground font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 pl-6">Exam</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Date Taken</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4 text-center">Percentage</th>
                                <th className="p-4 text-right">Grade / Status</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No results found.</td>
                                </tr>
                            ) : (
                                results.map((r) => {
                                    // Handle Pending Status
                                    if (r.status === 'PENDING') {
                                        return (
                                            <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="p-4 pl-6 text-foreground font-medium">{r.exam.title}</td>
                                                <td className="p-4 text-indigo-400 dark:text-purple-300">{r.exam.subject.name}</td>
                                                <td className="p-4">{new Date(r.submittedAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-center font-bold text-muted-foreground">-</td>
                                                <td className="p-4 text-center text-muted-foreground">-</td>
                                                <td className="p-4 text-right">
                                                    <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        Pending
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <Button disabled variant="outline" size="sm" className="opacity-50">View</Button>
                                                </td>
                                            </tr>
                                        )
                                    }

                                    const percentage = (r.score / r.totalScore) * 100
                                    let grade = 'F'
                                    let color = 'text-red-500 dark:text-red-400'
                                    if (percentage >= 80) { grade = 'A'; color = 'text-green-500 dark:text-green-400' }
                                    else if (percentage >= 70) { grade = 'B'; color = 'text-blue-500 dark:text-blue-400' }
                                    else if (percentage >= 60) { grade = 'C'; color = 'text-yellow-500 dark:text-yellow-400' }
                                    else if (percentage >= 50) { grade = 'D'; color = 'text-orange-500 dark:text-orange-400' }

                                    return (
                                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="p-4 pl-6 text-foreground font-medium">{r.exam.title}</td>
                                            <td className="p-4 text-indigo-400 dark:text-purple-300">{r.exam.subject.name}</td>
                                            <td className="p-4">{new Date(r.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-center font-bold text-foreground">{r.score} / {r.totalScore}</td>
                                            <td className="p-4 text-center">{percentage.toFixed(1)}%</td>
                                            <td className={`p-4 text-right font-bold ${color}`}>{grade}</td>
                                            <td className="p-4 text-right pr-6">
                                                <Link href={`/student/results/${r.id}`}>
                                                    <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-500">
                                                        View Result
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
