import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createExam } from '@/actions/exam'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import QuestionBuilder from '@/components/QuestionBuilder'

// Client Wrapper for form state
import ExamForm from './form'

export default async function CreateExamPage() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')
    const user = JSON.parse(session)

    // Fetch subjects assigned to this teacher
    const assignments = await prisma.teacherSubject.findMany({
        where: { teacherId: user.id },
        include: {
            subject: true,
            section: true
        }
    })

    // Group unique subjects/sections (simplified for list)
    // Actually we need to select a specific assignment tuple (Subject + Section)

    if (assignments.length === 0) {
        return (
            <div className="text-center p-12">
                <h2 className="text-xl text-yellow-500">No Subjects Assigned</h2>
                <p className="text-gray-400">Please ask the admin to assign you a subject and section first.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
                <Link href="/teacher/exams">
                    <Button className="bg-white/10 hover:bg-white/20">Cancel</Button>
                </Link>
            </div>

            <ExamForm assignments={assignments} />
        </div>
    )
}
