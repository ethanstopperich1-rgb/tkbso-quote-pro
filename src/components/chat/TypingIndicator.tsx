export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#111] border border-[#222] rounded-[12px] rounded-tl-[4px] px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#333]"
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
