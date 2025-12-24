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

    // Layers
    private floorLayer!: Phaser.GameObjects.Container;
    private shadowLayer!: Phaser.GameObjects.Container;
    private objectLayer!: Phaser.GameObjects.Container;
    private focusLayer!: Phaser.GameObjects.Container;
    private fxLayer!: Phaser.GameObjects.Container;

    // Focus visuals
    private focusOutline!: Phaser.GameObjects.Image;

    private completedSessions: number = 0;
    private plantSprite: Phaser.GameObjects.Image | null = null;

    // FX
    private vignette!: Phaser.GameObjects.Image;
    private noise!: Phaser.GameObjects.Image;

    constructor() {
        super('MainScene');
    }

    create() {
        // Init Layers
        this.floorLayer = this.add.container(0, 0).setDepth(0);
        this.shadowLayer = this.add.container(0, 0).setDepth(1);
        this.objectLayer = this.add.container(0, 0).setDepth(2);
        this.focusLayer = this.add.container(0, 0).setDepth(3);
        this.fxLayer = this.add.container(0, 0).setDepth(100);

        // 1. Initialize Map Data (0=Walkable, 1=Blocked)
        this.initializeMap();

        // 2. Visuals - Floor & Walls & Atmosphere
        this.createAtmosphere();

        // 3. Furniture (Sprites & Shadows)
        this.createFurniture();

        // 4. Pathfinding
        this.pathfinding = new Pathfinding();
        this.pathfinding.setup(this.gridMatrix);

        // 5. Player (Avatar)
        const startX = toWorld(2);
        const startY = toWorld(12);
        this.player = new Player(this, startX, startY);
        this.player.setTexture('avatar_idle'); // Use sprite
        this.objectLayer.add(this.player);

        // 6. Interaction & UI
        this.uiManager = new UIManager(this);
        this.timerSystem = new TimerSystem();
        this.taskManager = new TaskManager();

        this.setupFocusVisuals();
        this.setupGameSystems();

        // 7. Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const gx = toGrid(pointer.worldX);
            const gy = toGrid(pointer.worldY);
            this.handleMovementRequest(gx, gy);
        });
    }

    private createAtmosphere() {
        // Floor Tile
        const floor = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg_floor');
        floor.setOrigin(0, 0);
        this.floorLayer.add(floor);

        // FX in Top Layer
        const frame = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_frame').setOrigin(0.5);
        this.fxLayer.add(frame);

        this.vignette = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fx_vignette')
            .setOrigin(0.5).setAlpha(0.4);
        this.fxLayer.add(this.vignette);

        this.noise = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fx_noise')
            .setOrigin(0.5).setAlpha(0.15).setBlendMode(Phaser.BlendModes.OVERLAY);
        this.fxLayer.add(this.noise);
    }

    private setupFocusVisuals() {
        this.focusOutline = this.add.image(0, 0, 'ui_focus_outline').setOrigin(0.5).setAlpha(0);
        this.focusLayer.add(this.focusOutline);

        this.interactionManager = new InteractionManager(this, this.player);
        this.interactionManager.onShowOpenButton = (f) => {
            this.uiManager.showOpenButton(f, this.cameras.main);

            // Show Focus
            const centerPos = f.tilePositions[0];
            if (centerPos) {
                if (f.id === 'desk') this.updateFocus(9.5, 6.5);
                else if (f.id === 'sofa') this.updateFocus(16, 6.5);
                else if (f.id === 'letter_stand') this.updateFocus(7, 12);
                else if (f.id === 'sandglass') this.updateFocus(12, 8);
                else if (f.id === 'plant') this.updateFocus(14, 9);
                else if (f.id === 'window') this.updateFocus(10, 0);
                else if (f.id === 'door') this.updateFocus(0, 12);
            }
        };

        this.interactionManager.onHideOpenButton = () => {
            this.uiManager.hideOpenButton();
            this.focusOutline.setAlpha(0);
        };
    }

    private updateFocus(wx_grid: number, wy_grid: number) {
        const x = toWorld(wx_grid);
        const y = toWorld(wy_grid);
        this.focusOutline.setPosition(x, y);
        this.focusOutline.setAlpha(1);
        this.tweens.add({
            targets: this.focusOutline,
            alpha: 0.6,
            yoyo: true,
            duration: 800,
            repeat: -1
        });
    }

    private setupGameSystems() {
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
        this.uiManager.onTaskAction = (action, id, status, title) => {
            if (action === 'add' && title) this.taskManager.addTask(title);
            if (action === 'move' && id && status) this.taskManager.moveTask(id, status);
            if (action === 'delete' && id) this.taskManager.deleteTask(id);
        };

        // Hook UI Show Panel
        const originalShowPanel = this.uiManager.showPanel.bind(this.uiManager);
        this.uiManager.showPanel = (f) => {
            originalShowPanel(f);
            if (f.type === 'letter') {
                this.uiManager.updateTaskBoard(this.taskManager.getTasks());
            }
        }
    }

    private initializeMap() {
        for (let y = 0; y < 15; y++) {
            const row: number[] = [];
            for (let x = 0; x < 20; x++) {
                if (x === 0 || x === 19 || y === 0 || y === 14) row.push(1);
                else row.push(0);
            }
            this.gridMatrix.push(row);
        }
    }

    private createFurniture() {
        const block = (x: number, y: number) => {
            if (y >= 0 && y < 15 && x >= 0 && x < 20) {
                this.gridMatrix[y][x] = 1;
            }
        };

        const addObj = (key: string, gx: number, gy: number, shadowScale = 1.0) => {
            const x = toWorld(gx);
            const y = toWorld(gy);

            // Shadow
            const shadow = this.add.image(x, y + 10, 'shadow_oval')
                .setOrigin(0.5).setScale(shadowScale).setAlpha(0.5);
            this.shadowLayer.add(shadow);

            // Object
            const obj = this.add.image(x, y, key).setOrigin(0.5);
            this.objectLayer.add(obj);
            return obj;
        };

        // Desk (2x2)
        addObj('obj_desk', 9.5, 6.5, 0.8);
        block(9, 6); block(10, 6); block(9, 7); block(10, 7);

        // Sofa (3x2)
        addObj('obj_sofa', 16, 6.5, 0.9);
        block(15, 6); block(16, 6); block(17, 6);
        block(15, 7); block(16, 7); block(17, 7);

        // Letter Stand (3x1)
        addObj('obj_letterstand', 7, 12, 0.7);
        block(6, 12); block(7, 12); block(8, 12);

        // Sandglass (1x1)
        addObj('obj_hourglass', 12, 8, 0.5);
        block(12, 8);

        // Plant (1x1)
        this.plantSprite = addObj('obj_plant_stage0', 14, 9, 0.5);
        block(14, 9);

        // Window & Door (Visual)
        addObj('obj_window', 10, 0, 0);
        addObj('obj_door', 0, 12, 0).setAngle(90);
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
        if ((navigator as any).vibrate) (navigator as any).vibrate([200, 100, 200]);

        this.updatePlantGrowth();
        alert("Session Complete!");
    }

    private updatePlantGrowth() {
        if (!this.plantSprite) return;

        let texture = 'obj_plant_stage0';
        if (this.completedSessions >= 3) texture = 'obj_plant_stage1';
        if (this.completedSessions >= 6) texture = 'obj_plant_stage2';
        if (this.completedSessions >= 9) texture = 'obj_plant_stage3';

        this.plantSprite.setTexture(texture);

        this.tweens.add({
            targets: this.plantSprite,
            scale: { from: 0.8, to: 1.0 },
            duration: 500,
            ease: 'Bounce.easeOut'
        });
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.interactionManager.update(delta);
    }
}
