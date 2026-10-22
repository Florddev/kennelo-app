"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border font-semibold text-base outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-48 data-loading:select-none data-loading:text-transparent [&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-[calc(--spacing(5)-1px)]",
        icon: "size-10",
        "icon-lg": "size-12",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-xl": "size-14 [&_svg:not([class*='size-'])]:size-6",
        "icon-xs":
          "size-7 not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-[calc(--spacing(6)-1px)]",
        sm: "h-8 gap-1.5 px-[calc(--spacing(3.5)-1px)] text-sm [&_svg:not([class*='size-'])]:size-4",
        xl: "h-14 px-[calc(--spacing(8)-1px)] text-lg [&_svg:not([class*='size-'])]:size-6",
        xs: "h-7 gap-1 px-[calc(--spacing(2.5)-1px)] text-sm [&_svg:not([class*='size-'])]:size-4",
      },
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover data-pressed:bg-primary-active *:data-[slot=button-loading-indicator]:text-primary-foreground",
        destructive:
          "border-destructive bg-destructive text-white hover:bg-destructive/90 data-pressed:bg-destructive/90 *:data-[slot=button-loading-indicator]:text-white",
        "destructive-outline":
          "border-border bg-background text-destructive-foreground hover:bg-destructive-soft data-pressed:bg-destructive-soft *:data-[slot=button-loading-indicator]:text-foreground",
        ghost:
          "border-transparent text-link hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        link: "h-auto! border-transparent px-0! text-link underline decoration-1 underline-offset-4 hover:decoration-2 data-pressed:decoration-2 *:data-[slot=button-loading-indicator]:text-foreground",
        outline:
          "border-border bg-background text-foreground hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-neutral-hover data-pressed:bg-neutral-hover *:data-[slot=button-loading-indicator]:text-secondary-foreground",
      },
    },
  },
);

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled: boolean = Boolean(loading || disabledProp);
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}
