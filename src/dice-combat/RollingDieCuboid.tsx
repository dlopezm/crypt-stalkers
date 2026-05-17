import { motion } from "framer-motion";
import { useRef } from "react";
import { getFace } from "./dice-defs";
import { FACE_COLOR_CSS, FaceGlyphs } from "./FaceGlyphs";

// rotateX/rotateY on the container to bring each face index front-facing
const FACE_ROTATIONS: { rotateX: number; rotateY: number }[] = [
  { rotateX: 0, rotateY: 0 }, // 0 front
  { rotateX: 0, rotateY: -90 }, // 1 right
  { rotateX: 0, rotateY: 180 }, // 2 back
  { rotateX: 0, rotateY: 90 }, // 3 left
  { rotateX: 90, rotateY: 0 }, // 4 top
  { rotateX: -90, rotateY: 0 }, // 5 bottom
];

// CSS transforms that position each face as a side of the cuboid.
// half-dimensions must match .die-cuboid-face CSS: 76×90px full, 45×54px mini
function cuboidFaceTransform(i: number, mini: boolean): string {
  const hz = mini ? 22.5 : 38; // half-width, used as Z-offset for lateral faces
  const hy = mini ? 27 : 45; // half-height, used as Z-offset for top/bottom faces
  switch (i) {
    case 0:
      return `translateZ(${hz}px)`;
    case 1:
      return `rotateY(90deg) translateZ(${hz}px)`;
    case 2:
      return `rotateY(180deg) translateZ(${hz}px)`;
    case 3:
      return `rotateY(-90deg) translateZ(${hz}px)`;
    case 4:
      return `rotateX(-90deg) translateZ(${hy}px)`;
    case 5:
      return `rotateX(90deg) translateZ(${hy}px)`;
    default:
      return "";
  }
}

function DiceFacePanel({
  faceId,
  faceIndex,
  mini,
}: {
  faceId: string;
  faceIndex: number;
  mini: boolean;
}) {
  const face = getFace(faceId);
  if (!face) return null;
  return (
    <div className="die-cuboid-face" style={{ transform: cuboidFaceTransform(faceIndex, mini) }}>
      <div className="band" style={{ background: FACE_COLOR_CSS[face.color] }} />
      <div className="sym">
        <FaceGlyphs face={face} size={mini ? "14px" : "22px"} color={FACE_COLOR_CSS[face.color]} />
      </div>
    </div>
  );
}

export function RollingDieCuboid({
  die,
  resultFaceId,
  mini = false,
  delay = 0,
  onRollComplete,
}: {
  die: { faces: readonly [string, string, string, string, string, string] };
  resultFaceId: string;
  mini?: boolean;
  delay?: number;
  onRollComplete: () => void;
}) {
  const faceIndex = die.faces.indexOf(resultFaceId);
  if (import.meta.env.DEV && faceIndex === -1)
    console.warn(`RollingDieCuboid: faceId "${resultFaceId}" not found in die faces`, die.faces);
  const target = FACE_ROTATIONS[Math.max(0, faceIndex) % 6];

  // Randomize spin path and duration so each roll feels distinct
  const wobbleX = useRef(Math.random() * 180 - 90).current; // -90..+90 mid-spin tilt
  const wobbleY = useRef(Math.random() * 120 - 60).current; // -60..+60 mid-spin yaw offset
  const extraSpins = useRef(Math.floor(Math.random() * 2)).current; // 0 or 1 extra full rotation
  const duration = useRef(0.7 + Math.random() * 0.45).current; // 0.7–1.15s

  const baseY = -360 * (2 + extraSpins);
  const rx: number[] = [0, wobbleX, 360 + target.rotateX, target.rotateX];
  const ry: number[] = [0, baseY / 2 + wobbleY, baseY + target.rotateY, baseY + target.rotateY];

  return (
    <div className={`die-cuboid-wrap${mini ? " mini" : ""}`}>
      <motion.div
        className="die-cuboid-inner"
        initial={{ rotateX: 0, rotateY: 0 }}
        animate={{ rotateX: rx, rotateY: ry }}
        transition={{
          duration,
          delay,
          times: [0, 0.3, 0.68, 1.0],
          ease: "easeOut",
        }}
        onAnimationComplete={onRollComplete}
      >
        {die.faces.map((faceId, i) => (
          <DiceFacePanel key={i} faceId={faceId} faceIndex={i} mini={mini} />
        ))}
      </motion.div>
    </div>
  );
}
