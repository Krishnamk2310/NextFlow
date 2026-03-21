import { task } from "@trigger.dev/sdk/v3";

export const cropImageTask = task({
  id: "crop-image-task",
  maxDuration: 300,
  run: async (payload: { nodeRunId: string, imageUrl: string, x: number, y: number, w: number, h: number }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { outputUrl: payload.imageUrl + "?cropped=true" };
  }
});

export const extractFrameTask = task({
  id: "extract-frame-task",
  maxDuration: 300,
  run: async (payload: { nodeRunId: string, videoUrl: string, timestamp: string }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { outputUrl: payload.videoUrl + "?frame=" + payload.timestamp };
  }
});
