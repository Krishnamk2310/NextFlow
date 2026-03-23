# NextFlow


**NextFlow** is a premium, Krea-style workflow automation platform that leverages the power of Multimodal Large Language Models (LLMs) to process images, videos, and text in a cohesive, visual workspace. Build, execute, and restore complex data processing pipelines with a high-performance drag-and-drop interface.

<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/5e2b97aa-f7b4-4c56-af7f-2951351b0dff" />


---

## 🚀 Key Features

### 🎨 Visual Workflow Builder
Built with **React Flow (@xyflow/react)**, NextFlow provides a rich, interactive canvas:
- **Drag & Drop Nodes**: Easily add processing steps to your workspace.
- **Smart Connections**: Directional edges with type-safe validation (e.g., preventing image output from connecting to text input).
- **DAG Guardrails**: Automatic cycle detection to ensure acyclic graph (Directed Acyclic Graph) integrity.
- **Dynamic UI**: Responsive and fluid layout with Framer Motion animations and a glassmorphic dark-mode aesthetic.

### 🧠 AI-Powered Intelligence
Integrated with **Google Gemini (Generative AI)** for advanced multimodal capabilities:
- **Multimodal Analysis**: Analyze images, videos, and text simultaneously within a single node.
- **Custom Prompt Chaining**: Feed the output of one AI node into another, or combine multiple image/text sources for complex reasoning.
- **Vision-to-Text**: Direct Base64 processing for high-fidelity visual description and analysis.

### 🖼️ Media Manipulation & Tools
Native support for common image and video tasks:
- **Frame Extraction**: upload a video and extract specific frames at any timestamp (seconds or percentage) using **FFmpeg** for targeted AI analysis.
- **Image Cropping**: Precision cropping with coordinate and dimension controls to focus on specific regions of interest.
- **File Management**: Seamless asset handling with integrated file uploading via **Transloadit**.

### ⚡ Asynchronous Execution & Coordination
NextFlow uses **Trigger.dev v3** to handle distributed background workflows:
- **Topological Coordinator**: A robust engine manages the complex dependency chain of your DAG, ensuring nodes execute only when their inputs are ready.
- **Real-time Monitoring**: Track execution status (Running, Success, Failed) and view live outputs directly on the canvas and history sidebar.

### 🕰️ Workflow History & "Time Machine"
- **Run History**: Complete log of every workflow execution, including inputs, outputs, and durations.
- **One-Click Restore**: Mistake-proof your creative process with a "Time Machine" feature that allows you to restore any previous version of your workspace from its run history.

---

## 🛠️ Node Library

| Node Type | Description | Inputs | Outputs |
| :--- | :--- | :--- | :--- |
| **Text** | Static text input or constant prompt value. | - | `text` |
| **Upload Image**| Handlers image file selection and hosting. | - | `image_url` |
| **Upload Video**| Handlers video file selection and hosting. | - | `video_url` |
| **LLM (Gemini)** | The execution hub. Combines text and images for AI analysis. | `system_prompt`, `user_message`, `images` | `text` |
| **Crop Image** | Crops an input image based on percentages. | `image_url`, `x`, `y`, `width`, `height` | `image_url` |
| **Extract Frame**| Grabs a high-quality frame from a video at a timestamp. | `video_url`, `timestamp` | `image_url` |

---

## 🏗️ Technical Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Database**: [Prisma](https://www.prisma.io/) with [Neon](https://neon.tech/) (PostgreSQL)
- **Auth**: [Clerk](https://clerk.com/)
- **Workflow Engine**: [Trigger.dev v3](https://trigger.dev/)
- **Flow UI**: [@xyflow/react](https://reactflow.dev/)
- **AI**: [Google Generative AI](https://ai.google.dev/) (Gemini 1.5/2.0 Flash)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🏁 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd NextFlow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with your keys for Clerk, Neon, Gemini, and Trigger.dev.

4. **Prepare Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Servers**:
   ```bash
   # Terminal 1: Next.js dev server
   npm run dev
   
   # Terminal 2: Trigger.dev dev server
   npx trigger.dev@latest dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start building your flows!




