import { Button } from "@/components/ui/button";

interface DeactivationCardProps {
  isActive: boolean;
  isPending: boolean;
  onDeactivate: () => void;
}

export default function DeactivationCard({ isActive, isPending, onDeactivate }: DeactivationCardProps) {
  return (
    <div className={`bg-[#202225] rounded-md p-4 border ${!isActive ? 'border-gray-700' : 'border-[#f04747]/30'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-white">Deactivate Bot</h3>
        <Button
          onClick={onDeactivate}
          disabled={!isActive || isPending}
          className={`px-4 py-1.5 h-auto rounded-md ${
            !isActive
              ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
              : "bg-[#f04747] hover:bg-[#f04747]/80"
          }`}
        >
          {isPending ? "Deactivating..." : "Deactivate"}
        </Button>
      </div>
      <div className="text-sm opacity-80">
        <p>Bot will stop responding to audio files.</p>
        <code className="mt-2 block bg-black/30 p-2 rounded text-gray-400">
          /deactivate
        </code>
      </div>
    </div>
  );
}
