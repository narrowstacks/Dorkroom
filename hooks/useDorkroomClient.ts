import { useRef } from "react";
import { DorkroomClient } from "@/api/dorkroom/client";

/**
 * Hook that provides a singleton DorkroomClient instance.
 * Ensures the same client is reused across components.
 */
export function useDorkroomClient(): DorkroomClient {
  const clientRef = useRef<DorkroomClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = new DorkroomClient();
  }

  return clientRef.current;
}
