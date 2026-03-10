declare module "random-dungeon-generator" {
  interface DungeonOptions {
    width?: number;
    height?: number;
    minRoomSize?: number;
    maxRoomSize?: number;
  }
  export function NewDungeon(options: DungeonOptions): number[][];
}
