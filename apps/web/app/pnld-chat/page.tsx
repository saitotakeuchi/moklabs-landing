'use client';

import { useState, useCallback } from 'react';
import { Header, ChatInterface, CompactFooter } from '@/components/pnld-chat';

// Mock data for available editais - will be replaced with real data from API
const MOCK_EDITAIS = [
  { id: 'PNLD-2027-2030-ANOS-INICIAIS', name: 'PNLD 2027-2030 Anos Iniciais' },
  { id: 'PNLD-2027-2030-ANOS-FINAIS', name: 'PNLD 2027-2030 Anos Finais' },
  { id: 'PNLD-2027-2030-ENSINO-MEDIO', name: 'PNLD 2027-2030 Ensino Médio' },
];

export default function PNLDChatPage() {
  const [selectedEdital, setSelectedEdital] = useState<string | null>(null);

  const handleEditalSelect = useCallback((editalId: string) => {
    setSelectedEdital(editalId);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    // TODO: Implement actual API call to PNLD AI service
    console.log('Sending message:', message, 'for edital:', selectedEdital);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In the next ticket (MOK-33), we'll implement the actual API integration
  }, [selectedEdital]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header - fixed height */}
      <Header
        selectedEdital={selectedEdital}
        onEditalSelect={handleEditalSelect}
        availableEditais={MOCK_EDITAIS}
      />

      {/* Chat - flexible height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatInterface
          selectedEdital={selectedEdital}
          onEditalSelect={handleEditalSelect}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Footer - fixed height */}
      <CompactFooter />
    </div>
  );
}
