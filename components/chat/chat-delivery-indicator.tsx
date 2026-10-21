"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckCheckIcon,
  CheckIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons";
import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export type ChatDeliveryIndicatorProps = {
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  label: string;
};

export function ChatDeliveryIndicator({
  status,
  label,
}: ChatDeliveryIndicatorProps): ReactElement {
  const Icon = {
    sending: ClockIcon,
    sent: CheckIcon,
    delivered: CheckCheckIcon,
    read: CheckCheckIcon,
    failed: AlertCircleIcon,
  }[status];

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      data-slot="chat-delivery-indicator"
    >
      <HugeiconsIcon icon={Icon}
        aria-hidden="true"
        className={cn(
          "size-3",
          status === "read" && "text-sky-600 dark:text-sky-400",
          status === "failed" && "text-destructive",
        )}
      />
    </span>
  );
}
