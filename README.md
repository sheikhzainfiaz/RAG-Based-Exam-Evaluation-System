# AI-Powered Examination Management System (EMS) 🎓🤖

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Prisma](https://img.shields.io/badge/Prisma-ORM-green) ![N8N](https://img.shields.io/badge/N8N-Workflow-ff6b6b) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)

A next-generation **Examination Management System** that leverages **Generative AI** and **RAG (Retrieval-Augmented Generation)** to automate the entire exam lifecycle—from creating questions based on PDF course materials to instantly grading student submissions with contextual understanding.

## 🚀 Key Features

### 🧠 AI Exam Generator (RAG-Based)
*   **Upload & Generate**: Teachers simply upload a course PDF (notes, textbook chapters).
*   **Contextual Parsing**: The system (via N8N + LLM) reads the document and generates:
    *   **Short Answer Questions**
    *   **Long Form Questions**
    *   **Conceptual/Scenario Questions**
*   **Smart Formatting**: Automatically structures the exam with proper spacing and marks.

### 📝 Intelligent Auto-Grading
*   **Context-Aware**: Unlike simple keyword matching, our AI evaluates the *meaning* of student answers.
*   **Instant Feedback**: Students receive their grades and detailed feedback immediately after submission.
*   **Hybrid Workflow**: N8N handles the heavy lifting, ensuring scalability and reliability.

### 👥 Role-Based Dashboards
*   **Admin**: Manage teachers, students, classes, and view system-wide analytics.
*   **Teacher**: Create exams, monitor submissions, and view class performance stats.
*   **Student**: Take exams in a secure environment and view detailed performance breakdowns.

### 🎨 Premium UI/UX
*   **Glassmorphism Design**: Modern, sleek interface with blur effects and gradients.
*   **Dark Mode**: Fully optimized dark theme for reduced eye strain and "pro" aesthetic.
*   **Responsive**: Works seamlessly on desktops and tablets.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: SQLite (via [Prisma ORM](https://www.prisma.io/))
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **AI/Workflows**: [N8N](https://n8n.io/) (Webhook integration)
*   **Auth**: Custom Session-based Auth

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-ems.git
cd ems
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup (Prisma)
Initialize the SQLite database and run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
*Use `npx prisma studio` to inspect the database GUI.*

### 4. Admin Seeding
Seed the initial admin user to get access:
```bash
node scripts/seed.js
```
*Default Credentials:* `admin@ems.com` / `admin123`

### 5. Start the Server
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

---

## 🤖 N8N Workflow Configuration

This project relies on **N8N** for its AI capabilities. You need two workflows:

1.  **Exam Generator**: Accepts a PDF file -> Outputs structured questions (JSON).
2.  **Auto-Grader**: Accepts student answers + grading rubric -> Outputs scores.

**Configure Webhook URLs:**
Update the URLs in `src/actions/auto-grade.ts` and `src/app/api/generate-questions/route.ts` to match your N8N instance.

---

## 📸 Screenshots

*(Add your screenshots here)*

---

## 📜 License

This project is open-source and available under the MIT License.
