'use server'

export async function generateQuestionsAction(formData: FormData) {
    const file = formData.get('file') as File | null
    const numShort = formData.get('num_short')
    const numLong = formData.get('num_long')
    const numConceptual = formData.get('num_conceptual')

    console.log("--- AI PROXY START ---")
    console.log("Short:", numShort)
    console.log("FileObj:", file)
    if (file) {
        console.log("File Name:", file.name)
        console.log("File Type:", file.type)
        console.log("File Size:", file.size)
    }

    if (!file || file.size === 0) {
        console.error("No valid file received")
        return { error: 'No file uploaded or file is empty' }
    }

    try {
        // Convert File to Blob/Buffer to ensure it sends correctly in Node environment
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const n8nFormData = new FormData()
        // We append the buffer as a Blob with filename options
        const fileBlob = new Blob([buffer], { type: file.type || 'application/pdf' })
        n8nFormData.append('file', fileBlob, file.name)

        n8nFormData.append('num_short', numShort as string || '5')
        n8nFormData.append('num_long', numLong as string || '5')
        n8nFormData.append('num_conceptual', numConceptual as string || '5')

        console.log("Sending request to N8N...")

        const response = await fetch("http://localhost:5678/webhook/66583f58-2166-4177-8598-9f998ec9f2e1", {
            method: 'POST',
            body: n8nFormData,
            // @ts-ignore
            duplex: 'half'
        })

        console.log("N8N Response Status:", response.status)

        if (!response.ok) {
            const text = await response.text()
            console.error("N8N Error Body:", text)
            return { error: `N8N failed with status: ${response.status}` }
        }

        let data = await response.json()
        console.log("N8N Response Data Sample:", JSON.stringify(data).slice(0, 100))

        // Robust Parsing Logic
        if (Array.isArray(data)) data = data[0]?.json ?? data[0]
        if (data?.json) data = data.json

        const short = Array.isArray(data.short) ? data.short : []
        const long = Array.isArray(data.long) ? data.long : []
        const conceptual = Array.isArray(data.conceptual) ? data.conceptual : []

        return {
            success: true,
            data: { short, long, conceptual }
        }

    } catch (e) {
        console.error("Generate Action EXCEPTION:", e)
        return { error: 'Failed to connect to AI service (Check server logs)' }
    }
}
