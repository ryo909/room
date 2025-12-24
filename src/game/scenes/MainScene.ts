import Phaser from 'phaser';
import Player from '../objects/Player';
import Pathfinding from '../systems/Pathfinding';
import InteractionManager from '../systems/InteractionManager';
import UIManager from '../systems/UIManager';
import { toWorld, toGrid } from '../systems/Grid';
import TimerSystem from '../systems/TimerSystem';
import TaskManager from '../systems/TaskManager';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private pathfinding!: Pathfinding;
    private interactionManager!: InteractionManager;
    private uiManager!: UIManager;
    private timerSystem!: TimerSystem;
    private taskManager!: TaskManager;
    private gridMatrix: number[][] = [];

    private highlightGraphics!: Phaser.GameObjects.Graphics;

    private completedSessions: number = 0;
    private plantSprite: Phaser.GameObjects.Image | null = null;

    constructor() {
        super('MainScene');
    }

    create() {
        // 1. Initialize Map Data (0=Walkable, 1=Blocked)
        this.initializeMap();

        // 2. Visuals - Floor & Walls
        this.drawMap();

        // Highlight Graphics (Z-index above furniture, below UI)
        this.highlightGraphics = this.add.graphics();
        this.highlightGraphics.setDepth(10);

        // 3. Furniture
        this.createFurniture();

        // 4. Pathfinding
        this.pathfinding = new Pathfinding();
        this.pathfinding.setup(this.gridMatrix);

        // 5. Player
        const startX = toWorld(2);
        const startY = toWorld(12);
        this.player = new Player(this, startX, startY);
        this.player.setDepth(5);

        // 6. Interaction & UI
        this.uiManager = new UIManager(this);
        this.timerSystem = new TimerSystem();
        this.taskManager = new TaskManager();

        // Wire Timer -> UI
        this.timerSystem.onTick = (remaining) => {
            this.uiManager.updateTimerDisplay(remaining);
        };

        this.timerSystem.onComplete = () => {
            this.handleTimerComplete();
        };

        // Wire UI -> Timer
        this.uiManager.onTimerAction = (action) => {
            if (action === 'start') this.timerSystem.startFocus(25);
            if (action === 'pause') this.timerSystem.pause();
            if (action === 'resume') this.timerSystem.resume();
            if (action === 'stop') this.timerSystem.stop();

            if (action === 'break_5') this.timerSystem.startBreak(5);
            if (action === 'break_15') this.timerSystem.startBreak(15);

            if ((action as string).startsWith('set_')) {
                const mins = parseInt((action as string).split('_')[1]);
                this.timerSystem.startFocus(mins);
            }

            if (action === 'reset_data') {
                localStorage.clear();
                location.reload();
            }
        };

        // Wire Tasks -> UI
        this.taskManager.onTasksUpdated = (tasks) => {
            this.uiManager.updateTaskBoard(tasks);
        };

        // Wire UI -> Tasks
        this.uiManager.onTaskAction = (action, id, status, title) => {
            if (action === 'add' && title) this.taskManager.addTask(title);
            if (action === 'move' && id && status) this.taskManager.moveTask(id, status);
            if (action === 'delete' && id) this.taskManager.deleteTask(id);
        };

        this.interactionManager = new InteractionManager(this, this.player);
        this.interactionManager.onShowOpenButton = (f) => {
            this.uiManager.showOpenButton(f, this.cameras.main);

            // Draw Outline
            this.highlightGraphics.clear();
            this.highlightGraphics.lineStyle(2, 0xffd700, 0.8);
            f.tilePositions.forEach(pos => {
                const wx = toWorld(pos.x);
                const wy = toWorld(pos.y);
                this.highlightGraphics.strokeRect(wx - 16, wy - 16, 32, 32);
            });
        };

        this.interactionManager.onHideOpenButton = () => {
            this.uiManager.hideOpenButton();
            this.highlightGraphics.clear();
        };

        // Hook UI Show Panel to trigger Task update
        const originalShowPanel = this.uiManager.showPanel.bind(this.uiManager);
        this.uiManager.showPanel = (f) => {
            originalShowPanel(f);
            if (f.type === 'letter') {
                this.uiManager.updateTaskBoard(this.taskManager.getTasks());
            }
        }

        // 7. Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const gx = toGrid(pointer.worldX);
            const gy = toGrid(pointer.worldY);
            this.handleMovementRequest(gx, gy);
        });
    }

    private initializeMap() {
        // 20x15 grid
        for (let y = 0; y < 15; y++) {
            const row: number[] = [];
            for (let x = 0; x < 20; x++) {
                // Walls (Outer rim)
                if (x === 0 || x === 19 || y === 0 || y === 14) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            this.gridMatrix.push(row);
        }
    }

    private drawMap() {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 20; x++) {
                const wx = toWorld(x);
                const wy = toWorld(y);
                const isWall = this.gridMatrix[y][x] === 1;

                if (!isWall) {
                    this.add.image(wx, wy, 'floor');
                } else {
                    this.add.image(wx, wy, 'wall');
                }
            }
        }
    }

    private createFurniture() {
        const block = (x: number, y: number) => {
            if (y >= 0 && y < 15 && x >= 0 && x < 20) {
                this.gridMatrix[y][x] = 1;
            }
        };

        // Desk (2x2): (9,6),(10,6),(9,7),(10,7)
        this.add.image(toWorld(9.5), toWorld(6.5), 'desk');
        block(9, 6); block(10, 6); block(9, 7); block(10, 7);

        // Sofa (3x2): (15,6)..(17,7)
        this.add.image(toWorld(16), toWorld(6.5), 'sofa');
        block(15, 6); block(16, 6); block(17, 6);
        block(15, 7); block(16, 7); block(17, 7);

        // Letter Stand (3x1): (6,12)..(8,12)
        this.add.image(toWorld(7), toWorld(12), 'letter_stand');
        block(6, 12); block(7, 12); block(8, 12);

        // Sandglass (1x1): (12,8)
        this.add.image(toWorld(12), toWorld(8), 'sandglass');
        block(12, 8);

        // Plant (1x1): (14,9)
        this.plantSprite = this.add.image(toWorld(14), toWorld(9), 'plant');
        this.plantSprite.setScale(0.6); // Start small
        block(14, 9);

        // Window & Door (Visual Only, no block needed if on wall)
        // Window x=8..12, y=0
        // Door y=11..13, x=0
    }

    private async handleMovementRequest(gx: number, gy: number) {
        if (gx < 0 || gx >= 20 || gy < 0 || gy >= 15) return;

        const px = toGrid(this.player.x);
        const py = toGrid(this.player.y);

        const path = await this.pathfinding.findPath(px, py, gx, gy);

        if (path && path.length > 0) {
            this.player.followPath(path);
        }
    }

    private handleTimerComplete() {
        this.completedSessions++;

        // Haptics
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // Visual: Particles at Desk
        const wx = toWorld(9.5);
        const wy = toWorld(6.5);

        const particles = this.add.particles(wx, wy, 'floor', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: -50,
            quantity: 20,
            tint: 0xffff00
        });

        this.time.delayedCall(1500, () => {
            particles.destroy();
        });

        // Plant Growth
        this.updatePlantGrowth();

        alert("Session Complete! Take a break.");
    }

    private updatePlantGrowth() {
        if (!this.plantSprite) return;

        let scale = 0.6;
        if (this.completedSessions >= 3) scale = 0.8;
        if (this.completedSessions >= 6) scale = 1.2;

        this.tweens.add({
            targets: this.plantSprite,
            scale: scale,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.interactionManager.update(delta);
    }
}
