import { prisma } from '@/lib/prisma'
import { createUser, deleteUser } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function TeachersPage() {
    const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        orderBy: { createdAt: 'desc' },
    })

    async function addTeacher(formData: FormData) {
        'use server'
        await createUser('TEACHER', formData)
    }

    async function remove(id: string) {
        'use server'
        await deleteUser(id)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Manage Teachers</h1>
            </div>

            {/* Add Teacher Form */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg">
                <h2 className="mb-6 text-xl font-semibold text-white border-b border-white/10 pb-2">Add New Teacher</h2>
                <form action={addTeacher} className="grid gap-6 md:grid-cols-4 items-end">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
                        <Input name="name" required placeholder="John Doe" className="bg-black/20" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                        <Input name="email" type="email" required placeholder="john@school.com" className="bg-black/20" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                        <Input name="password" required type="text" placeholder="Password123" className="bg-black/20" />
                    </div>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 w-full mb-[2px]">
                        Create Teacher
                    </Button>
                </form>
            </div>

            {/* Teachers List */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-gray-200 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 pl-6">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No teachers found. Add one above.</td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6 text-white font-medium group-hover:text-indigo-300 transition-colors">{teacher.name}</td>
                                        <td className="p-4">{teacher.email}</td>
                                        <td className="p-4">{teacher.createdAt.toLocaleDateString()}</td>
                                        <td className="p-4 text-right pr-6">
                                            <form action={remove.bind(null, teacher.id)}>
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
    )
}
