import { Button } from "@/components/ui/button";

interface ActivationCardProps {
  isActive: boolean;
  isPending: boolean;
  onActivate: () => void;
}

export default function ActivationCard({ isActive, isPending, onActivate }: ActivationCardProps) {
  return (
    <div className={`bg-[#202225] rounded-md p-4 border ${isActive ? 'border-[#7289da]/30' : 'border-gray-700'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-white">Activate Bot</h3>
        <Button
          onClick={onActivate}
          disabled={isActive || isPending}
          className={`px-4 py-1.5 h-auto rounded-md ${
            isActive
              ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
              : "bg-[#7289da] hover:bg-[#7289da]/80"
          }`}
        >
          {isPending ? "Activating..." : "Activate"}
        </Button>
      </div>
      <div className="text-sm opacity-80">
        <p>Bot will respond with download links for audio files.</p>
        <code className="mt-2 block bg-black/30 p-2 rounded text-[#7289da]">
          /activate
        </code>
      </div>
    </div>
  );
}
