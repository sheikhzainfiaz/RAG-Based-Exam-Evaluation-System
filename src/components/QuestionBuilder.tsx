'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function QuestionBuilder() {
    const [count, setCount] = useState(1)

    const addQuestion = () => setCount(prev => prev + 1)

    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 transition-all hover:border-white/20">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">Q{idx + 1}</span>
                            Question Text
                        </h4>
                        {count > 1 && (
                            <Button type="button" onClick={() => setCount(c => c - 1)} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white h-7 px-2">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <Input
                        name={`question-${idx}-text`}
                        placeholder="e.g. What is the process of..."
                        className="bg-black/20 text-lg border-white/10 focus:border-indigo-500/50"
                    />

                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['opt1', 'opt2', 'opt3', 'opt4'].map((opt, i) => (
                                <div key={opt} className="relative group">
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-500 group-focus-within:text-indigo-400">{String.fromCharCode(65 + i)}</span>
                                    <Input
                                        name={`question-${idx}-${opt}`}
                                        placeholder={`Option ${i + 1}`}
                                        className="bg-black/20 pl-8"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="text-xs text-green-400 block mb-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Correct Answer (Exact match of one option)
                        </label>
                        <Input
                            name={`question-${idx}-correctAnswer`}
                            placeholder="Paste the correct option here..."
                            className="bg-green-900/10 border-green-500/20 text-green-100 placeholder:text-green-500/40 focus:border-green-500/50 focus:ring-green-500/20"
                        />
                    </div>
                </div>
            ))}

            <Button type="button" onClick={addQuestion} className="w-full border-dashed border-2 border-white/20 bg-transparent hover:bg-white/5 text-gray-400 h-12 hover:border-indigo-500/50 hover:text-indigo-400 transition-all">
                <Plus className="mr-2 h-4 w-4" /> Add Another Question
            </Button>
        </div>
    )
}
