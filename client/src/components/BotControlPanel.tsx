import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ActivationCard from "./ActivationCard";
import DeactivationCard from "./DeactivationCard";
import FeatureList from "./FeatureList";
import ActivityLog from "./ActivityLog";
import SupportedFormats from "./SupportedFormats";
import { Mic } from "lucide-react";
import { SUPPORTED_AUDIO_FORMATS } from "@shared/schema";

export default function BotControlPanel() {
  const { toast } = useToast();

  // Query for bot status
  const {
    data: botStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ["/api/bot/status"],
  });

  // Effect to handle status error
  useEffect(() => {
    if (statusError) {
      toast({
        title: "Error",
        description: "Failed to fetch bot status",
        variant: "destructive",
      });
    }
  }, [statusError, toast]);

  // Activate bot mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/bot/activate");
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: "Bot Activated",
        description: "Bot will now respond to audio file uploads.",
      });
    },
    onError: () => {
      toast({
        title: "Activation Failed",
        description: "Failed to activate the bot.",
        variant: "destructive",
      });
    },
  });

  // Deactivate bot mutation
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/bot/deactivate");
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: "Bot Deactivated",
        description: "Bot will no longer respond to audio file uploads.",
      });
    },
    onError: () => {
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate the bot.",
        variant: "destructive",
      });
    },
  });

  const handleActivate = () => {
    activateMutation.mutate();
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate();
  };

  // Determine bot status
  const isActive = botStatus?.isActive === true;
  const isPending = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#7289da] flex items-center justify-center text-white">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Audio Link Bot</h1>
              <p className="text-sm text-[#dcddde] opacity-80">
                Provides download links for audio files
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full ${
              isActive
                ? "bg-[#43b581]/20 text-[#43b581]"
                : "bg-[#f04747]/20 text-[#f04747]"
            } text-sm font-medium flex items-center gap-1.5`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isActive ? "bg-[#43b581]" : "bg-[#f04747]"
              }`}
            ></span>
            <span>{isActive ? "Online" : "Inactive"}</span>
          </div>
        </div>
      </header>

      {/* Main Control Section */}
      <main className="space-y-6">
        {/* Bot Controls */}
        <div className="bg-[#2f3136] rounded-lg p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Bot Controls</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ActivationCard 
              isActive={isActive} 
              isPending={isPending} 
              onActivate={handleActivate} 
            />
            <DeactivationCard 
              isActive={isActive} 
              isPending={isPending} 
              onDeactivate={handleDeactivate} 
            />
          </div>
        </div>

        {/* Feature Overview */}
        <div className="bg-[#2f3136] rounded-lg p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">How It Works</h2>
          <FeatureList />
        </div>

        {/* Activity Log */}
        <ActivityLog />

        {/* Supported File Types */}
        <SupportedFormats formats={SUPPORTED_AUDIO_FORMATS} />
      </main>

      {/* Footer */}
      <footer className="mt-10 text-center opacity-60 text-sm">
        <p>Audio Link Bot • Built with Discord.js • Version 1.0.0</p>
      </footer>
    </div>
  );
}
