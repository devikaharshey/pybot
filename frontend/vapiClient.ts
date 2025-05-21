import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;
let isStarted = false;

export function getVapi(): Vapi {
  if (!vapiInstance) {
    vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
  }
  return vapiInstance;
}

export async function startVapi(assistantId: string) {
  const vapi = getVapi();

  if (isStarted) {
    try {
      await vapi.stop();
    } catch (e) {
      console.warn("Error stopping previous Vapi call:", e);
    }
  }

  try {
    await vapi.start(assistantId);
    isStarted = true;
  } catch (err) {
    console.error("Vapi failed to start:", err);
  }
}

export function stopVapi() {
  if (vapiInstance && isStarted) {
    vapiInstance.stop();
    isStarted = false;
  }
}

export function destroyVapi() {
  stopVapi();
  vapiInstance = null;
}
