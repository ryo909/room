export const TILE_SIZE = 32;
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 15;

export const toWorld = (gridPos: number) => gridPos * TILE_SIZE + TILE_SIZE / 2;
export const toGrid = (worldPos: number) => Math.floor(worldPos / TILE_SIZE);

export const isWalkable = (gx: number, gy: number, obstacles: Set<string>) => {
    // Bounds
    if (gx < 0 || gx >= MAP_WIDTH || gy < 0 || gy >= MAP_HEIGHT) return false;
    // Walls (Outer rim)
    if (gx === 0 || gx === 19 || gy === 0 || gy === 14) return false;
    // Dynamic obstacles (Furniture)
    if (obstacles.has(`${gx},${gy}`)) return false;

    return true;
};
