import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LogEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLog() {
  const { toast } = useToast();
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Query for log entries
  const {
    data: logEntries,
    isLoading,
    error,
    refetch,
  } = useQuery<LogEntry[]>({
    queryKey: ["/api/log"],
  });

  // Effect to handle status error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activity log",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Clear log mutation
  const clearLogMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/log");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/log"] });
      toast({
        title: "Log Cleared",
        description: "Activity log has been cleared successfully.",
      });
      setIsConfirmingClear(false);
    },
    onError: () => {
      toast({
        title: "Clear Failed",
        description: "Failed to clear activity log.",
        variant: "destructive",
      });
    },
  });

  const handleClearLog = () => {
    if (isConfirmingClear) {
      clearLogMutation.mutate();
    } else {
      setIsConfirmingClear(true);
      
      // Reset confirmation after 5 seconds
      setTimeout(() => {
        setIsConfirmingClear(false);
      }, 5000);
    }
  };

  return (
    <div className="bg-[#2f3136] rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center justify-between">
        <span>Activity Log</span>
        <Button
          onClick={handleClearLog}
          variant="outline"
          size="sm"
          className={`text-xs ${
            isConfirmingClear
              ? "bg-[#f04747] hover:bg-[#f04747]/90 text-white border-[#f04747]"
              : "bg-[#202225] hover:bg-gray-700 text-white"
          }`}
          disabled={clearLogMutation.isPending}
        >
          {clearLogMutation.isPending
            ? "Clearing..."
            : isConfirmingClear
            ? "Confirm Clear"
            : "Clear Log"}
        </Button>
      </h2>
      
      <div className="h-64 overflow-y-auto bg-[#202225] rounded-md p-3">
        {isLoading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-3 border-b border-gray-700 pb-2">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </div>
              <Skeleton className="h-5 w-full bg-gray-700 mb-1" />
              <Skeleton className="h-5 w-3/4 bg-gray-700" />
            </div>
          ))
        ) : logEntries && logEntries.length > 0 ? (
          // Display log entries
          logEntries.map((entry) => (
            <div key={entry.id} className="log-entry mb-3 border-b border-gray-700 pb-2">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <span className="font-mono">
                  [{format(new Date(entry.timestamp), "HH:mm:ss")}]
                </span>
                <span 
                  className={`px-1.5 rounded-sm ${
                    entry.type === "BOT_ACTION"
                      ? "bg-[#7289da]/20 text-[#7289da]"
                      : entry.type === "DETECTED"
                      ? "bg-green-800/30 text-green-400"
                      : "bg-[#f04747]/20 text-[#f04747]"
                  }`}
                >
                  {entry.type}
                </span>
              </div>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatLogMessage(entry) }}></p>
              {entry.downloadUrl && (
                <p className="text-sm mt-1">
                  Download link:{" "}
                  <a
                    href={entry.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7289da] underline"
                  >
                    {truncateUrl(entry.downloadUrl)}
                  </a>
                </p>
              )}
            </div>
          ))
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No activity logged yet. Activate the bot to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format log messages with HTML
function formatLogMessage(entry: LogEntry): string {
  let message = entry.message;
  
  // Highlight channel names
  message = message.replace(
    /#([a-zA-Z0-9_-]+)/g,
    '<span class="text-[#7289da]">#$1</span>'
  );
  
  // Highlight usernames
  message = message.replace(
    /@([a-zA-Z0-9_-]+)/g,
    '<span class="text-[#faa61a]">@$1</span>'
  );
  
  // Highlight file names
  if (entry.fileName) {
    message = message.replace(
      entry.fileName,
      `<span class="text-white">${entry.fileName}</span>`
    );
  }
  
  return message;
}

// Helper function to truncate long URLs
function truncateUrl(url: string): string {
  if (url.length > 50) {
    return url.substring(0, 47) + "...";
  }
  return url;
}
