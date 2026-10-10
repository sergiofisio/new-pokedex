import type { ReactNode } from "react";
import Tavern from "../components/hearthstone/tavern";
import CollectionSync from "../components/hearthstone/collectionSync";
export default function HearthstoneLayout({ children }: { children: ReactNode }) {
  return (
    <Tavern>
      <CollectionSync />
      {children}
    </Tavern>
  );
}
