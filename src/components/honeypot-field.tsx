"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

interface HoneypotFieldProps {
  readonly registration: UseFormRegisterReturn;
}

export function HoneypotField({ registration }: HoneypotFieldProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        height: 0,
        overflow: "hidden",
      }}
    >
      <label htmlFor="website">Website</label>
      <input
        id="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...registration}
      />
    </div>
  );
}
