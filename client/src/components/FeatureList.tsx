export default function FeatureList() {
  const features = [
    {
      step: "1",
      text: "Activate the bot with <code class='px-1.5 py-0.5 bg-black/20 rounded text-sm'>/activate</code> command in any Discord channel",
    },
    {
      step: "2",
      text: "When users upload audio files (.mp3, .wav, etc.), the bot will automatically detect them",
    },
    {
      step: "3",
      text: "The bot will respond with direct download links for each audio file",
    },
    {
      step: "4",
      text: "Deactivate the bot with <code class='px-1.5 py-0.5 bg-black/20 rounded text-sm'>/deactivate</code> when you no longer need it",
    },
  ];

  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <div key={feature.step} className="flex items-start space-x-3">
          <div className="w-6 h-6 flex-shrink-0 rounded-full bg-[#7289da]/20 flex items-center justify-center text-[#7289da] mt-0.5">
            <span className="text-sm font-bold">{feature.step}</span>
          </div>
          <p dangerouslySetInnerHTML={{ __html: feature.text }}></p>
        </div>
      ))}
    </div>
  );
}
