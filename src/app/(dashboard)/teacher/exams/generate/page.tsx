import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AiGeneratorPage from './page'

// This file acts as the Server Component wrapper
// The logic is inside the Client Component `page.tsx` (which is confusingly named in the previous tool call, 
// so I will rename the component file to `client.tsx` effectively by writing to a new file and then importing it here).
// Wait, I already wrote the client code to `page.tsx`. Next.js App Router allows `page.tsx` to be 'use client'.
// But I need to fetch data (Assignments) from the server.
// Best practice: `page.tsx` is Server Component, `generator.tsx` is Client Component.

// RE-WRITING strategy:
// 1. Create `generator.tsx` with the client code I just wrote.
// 2. Create `page.tsx` (this file) to fetch data and render `generator.tsx`.

export default async function Page() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) redirect('/login')
    const user = JSON.parse(session)

    const assignments = await prisma.teacherSubject.findMany({
        where: { teacherId: user.id },
        include: {
            subject: true,
            section: true
        }
    })

    // We need to import the client component. 
    // Since I wrote the previous file to `page.tsx`, I made a mistake in file organization.
    // I will correct this by writing the client code to `generator.tsx` in the next step
    // and then this file will import it.

    // For now, I will just output this content to `layout.tsx` or similar? No.
    // I will overwrite `page.tsx` with this Server Component content, 
    // and write the Client Component to `generator.tsx`.

    return <AiGenerator assignments={assignments} />
}

import AiGenerator from './generator'
