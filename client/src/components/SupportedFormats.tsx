interface SupportedFormatsProps {
  formats: string[];
}

export default function SupportedFormats({ formats }: SupportedFormatsProps) {
  return (
    <div className="bg-[#2f3136] rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Supported Audio Formats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {formats.map((format) => (
          <div key={format} className="bg-[#202225] px-3 py-2 rounded-md text-center">
            <span className="text-sm font-medium">{format}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
