import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    console.log("API Route /api/generate-questions HIT")
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            console.error("API: No file found")
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        console.log(`API: Processing file ${file.name} (${file.size} bytes)`)

        // Forward to N8N
        const n8nResponse = await fetch("http://localhost:5678/webhook/66583f58-2166-4177-8598-9f998ec9f2e1", {
            method: 'POST',
            body: formData, // Pass the FormData directly, fetch handles boundaries
            // @ts-expect-error duplex is required for node fetch
            duplex: 'half'
        })

        if (!n8nResponse.ok) {
            const text = await n8nResponse.text()
            console.error(`API: N8N Error ${n8nResponse.status}: ${text}`)
            return NextResponse.json({ error: `N8N Error: ${text}` }, { status: 502 })
        }

        const data = await n8nResponse.json()
        console.log("API: N8N Success")
        return NextResponse.json(data)

    } catch (e: any) {
        console.error("API Proxy Error:", e)
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 })
    }
}
