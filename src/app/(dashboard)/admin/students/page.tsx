import { prisma } from '@/lib/prisma'
import { createStudent } from '@/actions/studentActions'
import { createSection } from '@/actions/academic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { deleteUser } from '@/actions/users'

export default async function StudentsPage() {
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: { studentSection: true },
        orderBy: { createdAt: 'desc' },
    })

    const sections = await prisma.section.findMany()

    async function addStudent(formData: FormData) {
        'use server'
        await createStudent(formData)
    }

    async function addSection(formData: FormData) {
        'use server'
        await createSection(formData)
    }

    async function remove(id: string) {
        'use server'
        await deleteUser(id)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Manage Students</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Create Student */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg">
                        <h2 className="mb-6 text-xl font-semibold text-white border-b border-white/10 pb-2">Add New Student</h2>
                        <form action={addStudent} className="grid gap-6 md:grid-cols-2 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Full Name</label>
                                <Input name="name" required placeholder="Alice Student" className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <Input name="email" type="email" required placeholder="alice@school.com" className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <Input name="password" required type="text" placeholder="Password123" className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Section</label>
                                <Select name="sectionId" className="bg-black/20">
                                    <option value="">Select Section</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id} className="text-black">{s.semester} - {s.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 w-full mb-[2px] col-span-full">
                                Create Student
                            </Button>
                        </form>
                    </div>

                    {/* Students List */}
                    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-200 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="p-4 pl-6">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Section</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">No students found.</td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 pl-6 text-white font-medium group-hover:text-indigo-300 transition-colors">{student.name}</td>
                                                <td className="p-4">{student.email}</td>
                                                <td className="p-4">
                                                    {student.studentSection ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                                                            {student.studentSection.semester} - {student.studentSection.name}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <form action={remove.bind(null, student.id)}>
                                                        <Button className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white h-8 px-3 text-xs w-auto">Delete</Button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Manage Sections */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg sticky top-6">
                        <h2 className="mb-6 text-xl font-semibold text-white border-b border-white/10 pb-2">Manage Sections</h2>
                        <form action={addSection} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Semester</label>
                                <Input name="semester" required placeholder="5th Semester" className="bg-black/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Section Name</label>
                                <Input name="name" required placeholder="Section A" className="bg-black/20" />
                            </div>
                            <Button type="submit" className="bg-green-600 hover:bg-green-500 w-full">
                                Add Section
                            </Button>
                        </form>

                        <div className="mt-8 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Existing Sections</h3>
                            {sections.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No sections created yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {sections.map(s => (
                                        <li key={s.id} className="flex justify-between p-3 rounded bg-white/5 border border-white/5 text-sm text-gray-300">
                                            <span>{s.semester}</span>
                                            <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-white">{s.name}</span>
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
