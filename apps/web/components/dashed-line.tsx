type DashedLineProps = {
  direction: "top" | "bottom" | "left" | "right";
  className?: string;
};

export const DashedLine = ({ direction, className = "" }: DashedLineProps) => {
  const isHorizontal = direction === "top" || direction === "bottom";

  const positionStyles = {
    bottom: "bottom-0",
    left: "left-0",
    right: "right-0",
    top: "top-0",
  };

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 ${positionStyles[direction]} ${isHorizontal ? "w-full" : "h-full"} ${className}`}
      height={isHorizontal ? "1" : "100%"}
      preserveAspectRatio="none"
      style={
        isHorizontal
          ? {
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
            }
          : {
              height: "100vh",
              top: "50%",
              transform: "translateY(-50%)",
            }
      }
      viewBox={isHorizontal ? "0 0 100 1" : "0 0 1 100"}
      width={isHorizontal ? "100%" : "1"}
    >
      <line
        stroke="var(--dashed-line-color)"
        strokeDasharray="6 6"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        x1={isHorizontal ? "0" : "0.5"}
        x2={isHorizontal ? "100" : "0.5"}
        y1={isHorizontal ? "0.5" : "0"}
        y2={isHorizontal ? "0.5" : "100"}
      />
    </svg>
  );
};
