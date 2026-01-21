'use client'

import React, { useState, useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { UploadCloud, FileText, Loader2, Sparkles, Save } from 'lucide-react'
import { saveAiExam } from '@/actions/ai-exam'
import { useRouter } from 'next/navigation'

export default function AiGenerator({ assignments }: { assignments: any[] }) {
    const [file, setFile] = useState<File | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // Generation State
    const [counts, setCounts] = useState({ short: 5, long: 5, conceptual: 5 })
    const [questionsBySection, setQuestionsBySection] = useState<any>({ short: [], long: [], conceptual: [] })
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

    // Form State
    const [state, formAction, isSaving] = useActionState(saveAiExam, null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) router.push('/teacher/exams')
    }, [state, router])

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0])
    }

    const generate = async () => {
        if (!file) return;
        setIsGenerating(true)
        setQuestionsBySection({ short: [], long: [], conceptual: [] }) // Reset previous
        setGeneratedQuestions([])

        const formData = new FormData()
        formData.append('file', file)
        formData.append('num_short', counts.short.toString())
        formData.append('num_long', counts.long.toString())
        formData.append('num_conceptual', counts.conceptual.toString())

        try {
            // CALL THE API ROUTE
            const res = await fetch('/api/generate-questions', {
                method: 'POST',
                body: formData
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || "Generation failed")
            }

            // Normalization logic
            let data = result
            // Handle N8N array wrapping
            if (Array.isArray(data)) data = data[0]?.json ?? data[0]
            if (data?.json) data = data.json

            console.log("Parsed Data:", data)

            let short: any[] = []
            let long: any[] = []
            let conceptual: any[] = []

            // Case 1: Questions are in a single array with 'type' field (User's provided format)
            if (data.questions && Array.isArray(data.questions)) {
                short = data.questions.filter((q: any) => q.type === 'short')
                long = data.questions.filter((q: any) => q.type === 'long')
                conceptual = data.questions.filter((q: any) => q.type === 'conceptual')
            }
            // Case 2: Questions are in separate keys (Old format fallback)
            else {
                short = Array.isArray(data.short) ? data.short : []
                long = Array.isArray(data.long) ? data.long : []
                conceptual = Array.isArray(data.conceptual) ? data.conceptual : []
            }

            setQuestionsBySection({ short, long, conceptual })

            const flat = [
                ...short.map((q: any) => ({ q_title: q.question || q, q_type: 'short', ...q })),
                ...long.map((q: any) => ({ q_title: q.question || q, q_type: 'long', ...q })),
                ...conceptual.map((q: any) => ({ q_title: q.question || q, q_type: 'conceptual', ...q })),
            ]
            setGeneratedQuestions(flat)

        } catch (e: any) {
            console.error("Client Gen Error:", e)
            alert(`Error: ${e.message}`)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleQuestionEdit = (type: string, index: number, newVal: string) => {
        const updatedSection = [...questionsBySection[type]]
        updatedSection[index] = { ...updatedSection[index], question: newVal }

        const updatedSections = { ...questionsBySection, [type]: updatedSection }
        setQuestionsBySection(updatedSections)

        const flat = [
            ...updatedSections.short.map((q: any) => ({ q_title: q.question || q, q_type: 'short', ...q })),
            ...updatedSections.long.map((q: any) => ({ q_title: q.question || q, q_type: 'long', ...q })),
            ...updatedSections.conceptual.map((q: any) => ({ q_title: q.question || q, q_type: 'conceptual', ...q })),
        ]
        setGeneratedQuestions(flat)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Question Generator
                </h1>
                <p className="text-gray-400">Upload a PDF and let our AI draft the exam for you.</p>
            </div>

            {/* MAIN FORM - Always Visible */}
            <form action={formAction} className="space-y-8">
                {/* 1. Exam Configuration */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                        Exam Configuration
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Input name="title" required placeholder="Exam Title (e.g. AI Generated Quiz)" className="bg-black/20 h-12 text-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input name="duration" required type="number" placeholder="Duration (min)" className="bg-black/20" />
                                <Select name="assignment_ref" required className="bg-black/20">
                                    <option value="">-- Select Class / Subject --</option>
                                    {assignments.map(a => (
                                        <option key={a.id} value={`${a.subjectId}|${a.sectionId}`}>
                                            {a.subject.name} ({a.section.semester} - {a.section.name})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {['short', 'long', 'conceptual'].map((t) => (
                                    <div key={t} className="space-y-1 flex-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">{t}</label>
                                        <Input
                                            type="number"
                                            value={counts[t as keyof typeof counts]}
                                            onChange={(e) => setCounts({ ...counts, [t]: parseInt(e.target.value) || 0 })}
                                            className="bg-black/40 text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFile}
                                />
                                <label
                                    htmlFor="pdf-upload"
                                    className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg h-12 cursor-pointer transition-all ${file ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 text-gray-400'}`}
                                >
                                    {file ? <><FileText className="h-4 w-4" /> {file.name}</> : <><UploadCloud className="h-4 w-4" /> Upload PDF</>}
                                </label>

                                <Button
                                    type="button"
                                    onClick={generate}
                                    disabled={!file || isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 w-40"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Questions Preview */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[200px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                            Generated Questions ({generatedQuestions.length})
                        </h3>

                        {generatedQuestions.length > 0 && (
                            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-500 px-8">
                                {isSaving ? 'Saving...' : 'Save to Database'} <Save className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {generatedQuestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                            {isGenerating ? 'AI is analyzing your document...' : 'Upload a PDF and click Generate to see questions here.'}
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <input type="hidden" name="questions_json" value={JSON.stringify(generatedQuestions)} />

                            {['short', 'long', 'conceptual'].map((type) => {
                                const questions = questionsBySection[type]
                                if (!questions.length) return null
                                const color = type === 'short' ? 'cyan' : type === 'long' ? 'blue' : 'indigo'

                                return (
                                    <div key={type} className="space-y-6">
                                        <h2 className={`text-2xl font-bold text-${color}-400 capitalize pl-2 border-l-4 border-${color}-500`}>{type} Questions</h2>
                                        <div className="grid gap-6">
                                            {questions.map((q: any, idx: number) => (
                                                <div key={idx} className={`bg-black/40 border border-${color}-500/30 p-6 rounded-2xl`}>
                                                    <textarea
                                                        value={q.question || q}
                                                        onChange={(e) => handleQuestionEdit(type, idx, e.target.value)}
                                                        className={`w-full bg-transparent text-lg font-medium text-gray-200 border-b border-white/10 focus:border-${color}-400 outline-none pb-2 resize-none`}
                                                        rows={2}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}
