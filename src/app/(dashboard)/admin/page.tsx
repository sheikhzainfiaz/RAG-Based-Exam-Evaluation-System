import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
    const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } })
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    const sectionCount = await prisma.section.count()
    const subjectCount = await prisma.subject.count()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the Administration Panel. Manage teachers, students, and course assignments.</p>

            <div className="grid gap-6 md:grid-cols-4">
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Total Teachers</h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-500">{teacherCount}</p>
                </div>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Total Students</h3>
                    <p className="mt-2 text-3xl font-bold text-purple-500">{studentCount}</p>
                </div>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Active Sections</h3>
                    <p className="mt-2 text-3xl font-bold text-pink-500">{sectionCount}</p>
                </div>
                <div className="premium-card">
                    <h3 className="text-lg font-medium text-foreground">Total Subjects</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-500">{subjectCount}</p>
                </div>
            </div>
        </div>
    )
}
