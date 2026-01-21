import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, GraduationCap, BookOpen, LogOut, FileText } from 'lucide-react'
import { logout } from '@/actions/auth'
import { ModeToggle } from '@/components/ModeToggle'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) redirect('/login')

    const user = JSON.parse(session)
    const role = user.role

    const adminLinks = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Teachers', href: '/admin/teachers', icon: Users },
        { name: 'Students', href: '/admin/students', icon: GraduationCap },
        { name: 'Assignments', href: '/admin/assignments', icon: BookOpen },
    ]

    const teacherLinks = [
        { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
        { name: 'Exams', href: '/teacher/exams', icon: FileText },
        { name: 'Results', href: '/teacher/results', icon: GraduationCap },
    ]

    const studentLinks = [
        { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
        { name: 'My Exams', href: '/student/exams', icon: FileText },
        { name: 'Results', href: '/student/results', icon: GraduationCap },
    ]

    const links = role === 'ADMIN' ? adminLinks : role === 'TEACHER' ? teacherLinks : studentLinks

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <span className="text-xl font-bold tracking-wider text-foreground">EMS Portal</span>
                </div>
                <nav className="p-4 space-y-2 flex-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <link.icon className="h-5 w-5" />
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-xl mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground lowercase">{role}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <ModeToggle />
                        <form action={logout}>
                            <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider">
                                <LogOut className="h-4 w-4" /> Log Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 p-8">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
