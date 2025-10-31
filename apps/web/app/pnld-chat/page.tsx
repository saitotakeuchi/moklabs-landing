"use client";

import { useState, useCallback, useEffect } from "react";
import { Header, ChatInterface, CompactFooter } from "@/components/pnld-chat";
import { pnldAiClient } from "@/lib/pnld-ai-client";
import type { Edital } from "@moklabs/pnld-types";

export default function PNLDChatPage() {
  const [selectedEdital, setSelectedEdital] = useState<string | null>(null);
  const [availableEditais, setAvailableEditais] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);

  // Fetch available editais on mount
  useEffect(() => {
    async function fetchEditais() {
      try {
        console.log("Fetching editais...");
        const response = await pnldAiClient.listEditais();
        console.log("Editais response:", response);
        const editais = response.editais.map((edital: Edital) => ({
          id: edital.id,
          name: edital.name,
        }));
        console.log("Mapped editais:", editais);
        setAvailableEditais(editais);
      } catch (error) {
        console.error("Failed to fetch editais:", error);
        // Optionally set empty array or show error state
        setAvailableEditais([]);
      } finally {
        setIsLoadingEditais(false);
      }
    }

    fetchEditais();
  }, []);

  const handleEditalSelect = useCallback((editalId: string) => {
    setSelectedEdital(editalId);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header - fixed height */}
      <Header
        selectedEdital={selectedEdital}
        onEditalSelect={handleEditalSelect}
        availableEditais={availableEditais}
        isLoadingEditais={isLoadingEditais}
      />

      {/* Chat - flexible height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatInterface
          selectedEdital={selectedEdital}
          onEditalSelect={handleEditalSelect}
        />
      </div>

      {/* Footer - fixed height */}
      <CompactFooter />
    </div>
  );
}
