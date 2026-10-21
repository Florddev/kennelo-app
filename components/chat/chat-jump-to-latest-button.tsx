"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDownIcon,
} from "@hugeicons/core-free-icons";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

export type ChatJumpToLatestButtonProps = Omit<
  ButtonProps,
  "children" | "size" | "variant"
> & {
  children: ReactNode;
};

export function ChatJumpToLatestButton({
  className,
  children,
  ...props
}: ChatJumpToLatestButtonProps): ReactElement {
  return (
    <div
      data-slot="chat-jump-to-latest"
      className="rounded-full bg-popover/90 backdrop-blur-xs"
    >
      <Button
        variant="outline"
        size="xs"
        className={cn(
          "pointer-events-auto gap-2 rounded-full before:rounded-full",
          className,
        )}
        {...props}
      >
        <HugeiconsIcon icon={ArrowDownIcon} aria-hidden="true" />
        {children}
      </Button>
    </div>
  );
}
