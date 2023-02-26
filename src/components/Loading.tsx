export const Loading = () => (
    <div className="text-5x flex gap-1 py-4">
        {new Array(3).fill(undefined).map((_, i) => (
            <span
                key={i}
                className={`animate-dot-${i} h-2 w-2 rounded-full bg-purple`}
            />
        ))}
    </div>
)
