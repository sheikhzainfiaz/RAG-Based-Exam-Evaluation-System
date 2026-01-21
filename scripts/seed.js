const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ems.com' },
        update: {},
        create: {
            email: 'admin@ems.com',
            name: 'System Admin',
            password: 'password', // Plain text for demo simplicity
            role: 'ADMIN',
        },
    })
    console.log('Admin user created:', admin)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
