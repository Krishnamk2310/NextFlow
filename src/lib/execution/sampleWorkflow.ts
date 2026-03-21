import { WorkflowExport } from "./schemas";

export const SAMPLE_WORKFLOW: WorkflowExport = {
  nodes: [
    {
      id: "text-sys-prompt",
      type: "text",
      position: { x: 50, y: 100 },
      data: { text: "You are a world-class product marketing expert. Generate a compelling social media ad copy based on the provided product details and images." },
    },
    {
      id: "text-details",
      type: "text",
      position: { x: 50, y: 300 },
      data: { text: "Product: NextFlow Pro\nFeatures: DAG Builder, Visual Canvas, AI Automation.\nTarget Audience: Developers and Creators." },
    },
    {
      id: "upload-image",
      type: "upload-image",
      position: { x: 50, y: 500 },
      data: { imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=400&auto=format&fit=crop" },
    },
    {
      id: "crop-image",
      type: "crop-image",
      position: { x: 450, y: 550 },
      data: { x_percent: 10, y_percent: 10, width_percent: 80, height_percent: 80 },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 450, y: 150 },
      data: { model: "gemini-2.0-flash" },
    },
    {
      id: "upload-video",
      type: "upload-video",
      position: { x: 50, y: 800 },
      data: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
    },
    {
      id: "extract-frame",
      type: "extract-frame",
      position: { x: 450, y: 800 },
      data: { timestamp: "50%" },
    },
    {
      id: "final-llm",
      type: "llm",
      position: { x: 1000, y: 450 },
      data: { model: "gemini-2.0-flash" },
    }
  ],
  edges: [
    { id: "e1", source: "text-sys-prompt", target: "llm-1", sourceHandle: "output", targetHandle: "system_prompt" },
    { id: "e2", source: "text-details", target: "llm-1", sourceHandle: "output", targetHandle: "user_message" },
    { id: "e3", source: "upload-image", target: "crop-image", sourceHandle: "output", targetHandle: "image_url" },
    { id: "e4", source: "upload-video", target: "extract-frame", sourceHandle: "output", targetHandle: "video_url" },
    { id: "e5", source: "llm-1", target: "final-llm", sourceHandle: "output", targetHandle: "user_message" },
    { id: "e6", source: "crop-image", target: "final-llm", sourceHandle: "output", targetHandle: "images" },
    { id: "e7", source: "extract-frame", target: "final-llm", sourceHandle: "output", targetHandle: "images" },
    { id: "e8", source: "text-sys-prompt", target: "final-llm", sourceHandle: "output", targetHandle: "system_prompt" }
  ]
};
