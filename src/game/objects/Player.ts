import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    private targetX: number;
    private targetY: number;
    public isMoving: boolean = false;
    private readonly SPEED_PIXELS_PER_SEC = 32 * 4; // 4 tiles/sec

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.scene.add.existing(this);
        this.setOrigin(0.5, 0.5);

        // Initial state
        this.targetX = x;
        this.targetY = y;
    }

    moveTo(worldX: number, worldY: number) {
        // Simple direct movement for now (will replace with pathfinding path following later)
        this.targetX = worldX;
        this.targetY = worldY;
        this.isMoving = true;

        // Utilize Phaser's physics or tween?
        // User requested "Deceleration 0.35s before stop" - Tween is good for this control.
        // However, A* path following usually implies linear segments.
        // For now, let's implement linear movement to the target tile center.

        // Calculate distance and duration
        const dist = Phaser.Math.Distance.Between(this.x, this.y, worldX, worldY);
        const duration = (dist / this.SPEED_PIXELS_PER_SEC) * 1000;

        if (duration > 0) {
            this.scene.tweens.add({
                targets: this,
                x: worldX,
                y: worldY,
                duration: duration,
                ease: 'Linear', // Or 'Quad.easeOut' for deceleration feel at the very end
                onComplete: () => {
                    this.isMoving = false;
                    this.scene.events.emit('player_arrived', { x: worldX, y: worldY });
                }
            });
        }
    }

    // Path following logic will go here
    async followPath(path: { x: number, y: number }[]) {
        // Stop current movement
        this.scene.tweens.killTweensOf(this);
        this.isMoving = true;

        // Path includes start node (sometimes) - check Easystar behavior. 
        // Usually it includes start if we ask? Actually it returns path FROM start TO end.
        // If path[0] is current pos, skip it.

        let pathIndex = 0;

        // Helper to move to next node
        const moveToNext = () => {
            if (pathIndex >= path.length) {
                this.isMoving = false;
                this.scene.events.emit('player_arrived', { x: this.targetX, y: this.targetY }); // Final
                return;
            }

            const node = path[pathIndex];
            pathIndex++;

            // Convert grid to world
            // Assuming toWorld is imported or we use simple math here
            const wx = node.x * 32 + 16;
            const wy = node.y * 32 + 16;

            this.targetX = wx;
            this.targetY = wy;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, wx, wy);
            const duration = (dist / this.SPEED_PIXELS_PER_SEC) * 1000;

            this.scene.tweens.add({
                targets: this,
                x: wx,
                y: wy,
                duration: duration,
                ease: 'Linear',
                onComplete: moveToNext
            });
        };

        moveToNext();
    }

    update(_time: number, _delta: number) {
        // additional logic
    }
}
