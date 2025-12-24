import EasyStar from 'easystarjs';


export default class Pathfinding {
    private easystar: EasyStar.js;

    constructor() {
        this.easystar = new EasyStar.js();
        this.easystar.enableDiagonals();
        this.easystar.disableCornerCutting();
    }

    setup(grid: number[][]) {
        this.easystar.setGrid(grid);
        this.easystar.setAcceptableTiles([0]); // 0 = Walkable, 1 = Wall/Obstacle
    }

    findPath(sx: number, sy: number, ex: number, ey: number): Promise<{ x: number, y: number }[] | null> {
        return new Promise((resolve) => {
            this.easystar.findPath(sx, sy, ex, ey, (path) => {
                if (path === null) {
                    resolve(null);
                } else {
                    resolve(path);
                }
            });
            this.easystar.calculate();
        });
    }
}
