declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
    };

    Storage: {
    };

    UserMeta: {
      id: string;
      info: {
        name?: string;
        avatar?: string;
        color: string;
      };
    };

    RoomEvent: {};

    ThreadMetadata: {
    };

    RoomInfo: {
    };
  }
}

export {};
