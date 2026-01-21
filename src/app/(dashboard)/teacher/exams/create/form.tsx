'use client'

import React, { useActionState, useEffect } from 'react'
import { createExam, ExamState } from '@/actions/exam'
import QuestionBuilder from '@/components/QuestionBuilder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

const initialState: ExamState = {}

export default function ExamForm({ assignments }: { assignments: any[] }) {
    const [state, formAction, isPending] = useActionState(createExam, initialState)
    const router = useRouter()

    useEffect(() => {
        if (state.success) {
            router.push('/teacher/exams')
        }
    }, [state, router])

    return (
        <form action={formAction} className="space-y-8">
            {state.errors?._form && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center font-medium">
                    {state.errors._form[0]}
                </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Exam Title</label>
                        <Input
                            name="title"
                            placeholder="Midterm Exam 2024"
                            className={state.errors?.title ? "border-red-500" : ""}
                        />
                        {state.errors?.title && <p className="text-xs text-red-400">{state.errors.title[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Duration (Minutes)</label>
                        <Input
                            name="duration"
                            type="number"
                            placeholder="60"
                            className={state.errors?.duration ? "border-red-500" : ""}
                        />
                        {state.errors?.duration && <p className="text-xs text-red-400">{state.errors.duration[0]}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Select Class (Subject & Section)</label>
                    <div className="relative">
                        <Select
                            name="assignment_ref"
                            className={`bg-black/20 appearance-none ${state.errors?.assignment_ref ? "border-red-500" : ""}`}
                        >
                            <option value="">-- Select Class --</option>
                            {assignments.map(a => (
                                <option key={a.id} value={`${a.subjectId}|${a.sectionId}`}>
                                    {a.subject.name} (Section: {a.section.semester} - {a.section.name})
                                </option>
                            ))}
                        </Select>
                    </div>
                    {state.errors?.assignment_ref && <p className="text-xs text-red-400">{state.errors.assignment_ref[0]}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Questions</h2>
                {state.errors?.questions && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded">Error: {state.errors.questions[0]}</p>}
                <QuestionBuilder />
            </div>

            <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 px-8 h-12 text-lg disabled:opacity-50">
                    {isPending ? 'Publishing...' : 'Publish Exam'}
                </Button>
            </div>
        </form>
    )
}
