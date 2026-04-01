export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/30"
            style={{
              animation: 'tkb-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
