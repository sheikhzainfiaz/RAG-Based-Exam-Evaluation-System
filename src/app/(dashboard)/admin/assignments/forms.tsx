'use client'

import React, { useActionState } from 'react'
import { assignTeacher, createSubject } from '@/actions/academic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

// We need to separate forms to use independent states
function AssignForm({ teachers, subjects, sections }: { teachers: any[], subjects: any[], sections: any[] }) {
    const [state, formAction, isPending] = useActionState(assignTeacher, {})

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg">
            <h2 className="mb-6 text-xl font-semibold text-white border-b border-white/10 pb-2">Assign Teacher</h2>
            {state.errors?._form && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded border border-red-500/20">
                    {state.errors._form[0]}
                </div>
            )}
            <form action={formAction} className="grid md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Teacher</label>
                    <Select name="teacherId" className={state.errors?.teacherId ? "border-red-500" : ""}>
                        <option value="">Select Teacher</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id} className="text-black">{t.name}</option>
                        ))}
                    </Select>
                    {state.errors?.teacherId && <span className="text-xs text-red-500">{state.errors.teacherId[0]}</span>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Subject</label>
                    <Select name="subjectId" className={state.errors?.subjectId ? "border-red-500" : ""}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                        ))}
                    </Select>
                    {state.errors?.subjectId && <span className="text-xs text-red-500">{state.errors.subjectId[0]}</span>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Section</label>
                    <Select name="sectionId" className={state.errors?.sectionId ? "border-red-500" : ""}>
                        <option value="">Select Section</option>
                        {sections.map(s => (
                            <option key={s.id} value={s.id} className="text-black">
                                {s.semester} - {s.name}
                            </option>
                        ))}
                    </Select>
                    {state.errors?.sectionId && <span className="text-xs text-red-500">{state.errors.sectionId[0]}</span>}
                </div>
                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 w-full mb-[2px] col-span-full">
                    {isPending ? 'Assigning...' : 'Assign Course'}
                </Button>
            </form>
        </div>
    )
}

function SubjectForm() {
    const [state, formAction, isPending] = useActionState(createSubject, {})
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg sticky top-6">
            <h2 className="mb-6 text-xl font-semibold text-white border-b border-white/10 pb-2">Subjects</h2>
            {state.errors?._form && <p className="text-red-400 text-xs mb-2">{state.errors._form[0]}</p>}
            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Subject Name</label>
                    <Input
                        name="name"
                        placeholder="Mathematics"
                        className={`bg-black/20 ${state.errors?.name ? 'border-red-500' : ''}`}
                    />
                    {state.errors?.name && <span className="text-xs text-red-500">{state.errors.name[0]}</span>}
                </div>
                <Button type="submit" disabled={isPending} className="bg-purple-600 hover:bg-purple-500 w-full">
                    Add Subject
                </Button>
            </form>
        </div>
    )
}

export { AssignForm, SubjectForm }
