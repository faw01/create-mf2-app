"use client";

import {
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";
import type { RefObject } from "react";
import { useRef, useState } from "react";
import { keys } from "../keys";

import "@knocklabs/react/dist/index.css";
import "../styles.css";

export const NotificationsTrigger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = (event: Event) => {
    if (event.target === notifButtonRef.current) {
      return;
    }

    setIsVisible(false);
  };

  const handleToggle = () => {
    setIsVisible((visible) => !visible);
  };

  if (!keys().NEXT_PUBLIC_KNOCK_API_KEY) {
    return null;
  }

  return (
    <>
      <NotificationIconButton onClick={handleToggle} ref={notifButtonRef} />
      {notifButtonRef.current ? (
        <NotificationFeedPopover
          buttonRef={notifButtonRef as RefObject<HTMLElement>}
          isVisible={isVisible}
          onClose={handleClose}
        />
      ) : null}
    </>
  );
};
