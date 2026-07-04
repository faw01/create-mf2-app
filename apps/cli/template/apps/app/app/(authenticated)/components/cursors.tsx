"use client";

import { useMyPresence, useOthers } from "@repo/collaboration/hooks";
import { useEffect } from "react";

const Cursor = ({
  name,
  color,
  x,
  y,
}: {
  name: string | undefined;
  color: string;
  x: number;
  y: number;
}) => (
  <div
    className="pointer-events-none absolute top-0 left-0 z-[999] select-none transition-transform duration-100"
    style={{
      transform: `translateX(${x}px) translateY(${y}px)`,
    }}
  >
    <svg
      className="absolute top-0 left-0"
      fill="none"
      height="36"
      viewBox="0 0 24 36"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cursor</title>
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
      />
    </svg>
    <div
      className="absolute top-4 left-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-white text-xs"
      style={{
        backgroundColor: color,
      }}
    >
      {name}
    </div>
  </div>
);

export const Cursors = () => {
  const [_cursor, updateMyPresence] = useMyPresence();
  const others = useOthers();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        },
      });
    };

    const onPointerLeave = () => {
      updateMyPresence({
        cursor: null,
      });
    };

    document.body.addEventListener("pointermove", onPointerMove);
    document.body.addEventListener("pointerleave", onPointerLeave);

    return () => {
      document.body.removeEventListener("pointermove", onPointerMove);
      document.body.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [updateMyPresence]);

  return others.map(({ connectionId, presence, info }) => {
    if (!presence.cursor) {
      return null;
    }

    return (
      <Cursor
        color={info.color}
        key={`cursor-${connectionId}`}
        name={info?.name}
        x={presence.cursor.x}
        y={presence.cursor.y}
      />
    );
  });
};
