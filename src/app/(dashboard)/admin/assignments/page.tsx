import { prisma } from '@/lib/prisma'
import { AssignForm, SubjectForm } from './forms'

export default async function AssignmentsPage() {
    const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } })
    const subjects = await prisma.subject.findMany()
    const sections = await prisma.section.findMany()

    const assignments = await prisma.teacherSubject.findMany({
        include: {
            teacher: true,
            subject: true,
            section: true
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Course Assignments</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column: Assignment Form & List */}
                <div className="lg:col-span-2 space-y-8">
                    <AssignForm teachers={teachers} subjects={subjects} sections={sections} />

                    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-200 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="p-4 pl-6">Teacher</th>
                                        <th className="p-4">Subject</th>
                                        <th className="p-4">Section</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">No active assignments.</td>
                                        </tr>
                                    ) : (
                                        assignments.map((a) => (
                                            <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 pl-6 text-white font-medium">{a.teacher.name}</td>
                                                <td className="p-4 text-purple-300">{a.subject.name}</td>
                                                <td className="p-4 text-xs">
                                                    <span className="bg-white/10 px-2 py-1 rounded text-white">{a.section.semester} - {a.section.name}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Manage Subjects */}
                <div className="space-y-8">
                    <SubjectForm />

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg sticky top-[280px]">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Library</h3>
                            {subjects.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No subjects added.</p>
                            ) : (
                                <ul className="space-y-2 max-h-64 overflow-y-auto">
                                    {subjects.map(s => (
                                        <li key={s.id} className="p-3 rounded bg-white/5 border border-white/5 text-sm text-gray-300">
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
