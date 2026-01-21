'use client'

import { useState } from 'react'
import { triggerAutoGrading } from '@/actions/auto-grade'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AutoGradeButton({ resultId }: { resultId: string }) {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        if (!confirm("Send this submission to AI Agent for grading?")) return;

        setLoading(true)
        try {
            await triggerAutoGrading(resultId)
            alert("Sent to AI! scores will update automatically once processed.")
        } catch (e) {
            alert("Failed to trigger agent.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Auto-Grade
                </>
            )}
        </Button>
    )
}
