import type { IconProps } from "./index";
export function IconFocus({ className, style }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M256 96C167.6 96 96 167.6 96 256s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 288c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128zm0-208c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zm0 128c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zM240 32v48h32V32h-32zm0 400v48h32v-48h-32zM32 240v32h48v-32H32zm400 0v32h48v-32h-48z" />
    </svg>
  );
}
