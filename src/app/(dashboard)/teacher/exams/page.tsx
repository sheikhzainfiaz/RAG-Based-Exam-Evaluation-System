import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus } from 'lucide-react'

export default async function ExamsListPage() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const user = JSON.parse(session || '{}')

    const exams = await prisma.exam.findMany({
        where: { creatorId: user.id },
        include: { section: true, subject: true, _count: { select: { questions: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">My Exams</h1>
                <div className="flex gap-4">
                    <Link href="/teacher/exams/generate">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0 shadow-lg shadow-blue-500/20 text-white">
                            <Sparkles className="mr-2 h-4 w-4" /> AI Generator
                        </Button>
                    </Link>
                    <Link href="/teacher/exams/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Manual Create
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-muted-foreground">
                        <thead className="bg-muted/50 text-foreground font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 pl-6">Title</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Class</th>
                                <th className="p-4 text-center">Questions</th>
                                <th className="p-4">Date Created</th>
                                <th className="p-4 text-right pr-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No exams created yet.</td>
                                </tr>
                            ) : (
                                exams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4 pl-6 text-foreground font-medium text-base">{exam.title}</td>
                                        <td className="p-4 text-indigo-400 dark:text-purple-300 font-medium">{exam.subject.name}</td>
                                        <td className="p-4">
                                            <span className="bg-accent px-2 py-1 rounded text-foreground text-xs font-bold">{exam.section.semester} - {exam.section.name}</span>
                                        </td>
                                        <td className="p-4 text-center">{exam._count.questions}</td>
                                        <td className="p-4">{new Date(exam.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right pr-6">
                                            <span className="text-green-500 text-xs uppercase font-bold tracking-wider bg-green-500/10 px-2 py-1 rounded">Active</span>
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
