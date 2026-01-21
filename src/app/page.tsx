import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black bg-gradient-to-br from-gray-900 to-black p-24 text-white">
      <div className="mt-16 flex flex-col items-center gap-8">
        <p className="text-center text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-500 max-w-2xl leading-relaxed mx-auto w-full">
          RAG based Examination Management System
        </p>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8">
        <p className="text-center text-xl text-gray-400 max-w-2xl leading-relaxed mx-auto w-full">
          A comprehensive platform for managing exams, teachers, and students with a premium and modern experience.
        </p>

        <Link href="/login">
          <Button className="h-14 px-10 text-lg bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
            Get Started
          </Button>
        </Link>
      </div>
    </main>
  )
}
