import type { IconProps } from "./index";
export function IconDie({ className, style }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path
        fillRule="evenodd"
        d="
          M18 5 h64 a13 13 0 0 1 13 13 v64 a13 13 0 0 1 -13 13 H18 A13 13 0 0 1 5 82 V18 A13 13 0 0 1 18 5 Z
          M30 19 a9 9 0 1 0 0.001 0 Z
          M70 19 a9 9 0 1 0 0.001 0 Z
          M30 50 a9 9 0 1 0 0.001 0 Z
          M70 50 a9 9 0 1 0 0.001 0 Z
          M30 81 a9 9 0 1 0 0.001 0 Z
          M70 81 a9 9 0 1 0 0.001 0 Z
        "
      />
    </svg>
  );
}
