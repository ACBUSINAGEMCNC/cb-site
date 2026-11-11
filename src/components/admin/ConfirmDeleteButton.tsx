"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

type ConfirmDeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmation: string;
};

export default function ConfirmDeleteButton({
  confirmation,
  onClick,
  ...props
}: ConfirmDeleteButtonProps) {
  function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && !window.confirm(confirmation)) {
      event.preventDefault();
    }
  }

  return <button {...props} type="submit" onClick={confirmDelete} />;
}
