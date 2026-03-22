# NextFlow


**NextFlow** is a premium, Krea-style workflow automation platform that leverages the power of Multimodal Large Language Models (LLMs) to process images, videos, and text in a cohesive, visual workspace.

<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/5e2b97aa-f7b4-4c56-af7f-2951351b0dff" />


## ✨ Core Features

- **🧠 Multimodal LLM Intelligence**: Integrated with **Gemini 2.0 Flash**, allowing for deep analysis of both text and visual data.
- **📸 Intelligent Frame Extraction**: Upload videos and extract specific frames at any timestamp (seconds or percentage) for targeted AI analysis.
- **👁️ Vision Support**: Direct Base64 image encoding for seamless "image-to-text" and "image-to-analysis" workflows.
- **🕰️ Workflow Time Machine**: Complete **Run History** with a one-click **Restore** feature to jump back to any previous version of your workspace.
- **🎨 Premium UI/UX**: A sleek, dark-mode interface inspired by modern design tools like Krea and Framer.
- **🗑️ Interactive Canvas**: Full control over your logic with draggable nodes, smart connections, and easy node deletion.

## 🧩 Node Reference

| Node | Purpose |
|------|---------|
| **Text** | Input any raw text or professional prompts for the workflow. |
| **Upload Image** | Upload a local image or use a remote URL as a visual input. |
| **Upload Video** | Support for MP4, MOV, and WEBM video uploads. |
| **Extract Frame** | Seek to a specific second or `%` in a video and capture a high-quality frame. |
| **Run Any LLM** | The execution hub. Combines text and images for analysis via **Gemini 2.0 Flash**. |
| **Crop Image** | A utility node for future image preprocessing and focused area analysis. |

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Workflow Engine**: [@xyflow/react](https://reactflow.dev/) (formerly React Flow)
- **AI**: [Google Generative AI SDK](https://ai.google.dev/) (Gemini 2.0 Flash)
- **Database**: [Prisma](https://www.prisma.io/) + [Neon (PostgreSQL)](https://neon.tech/)
- **Auth**: [Clerk](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A Google AI Studio API Key (for Gemini)
- A Neon Database URL
- A Clerk Account (for authentication)

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your-neon-db-url"
GEMINI_API_KEY="your-gemini-api-key"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-key"
CLERK_SECRET_KEY="your-clerk-secret"
```

### 3. Installation
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building your flows!


