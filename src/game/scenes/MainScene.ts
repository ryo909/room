import Phaser from 'phaser';
import Player from '../objects/Player';
import Pathfinding from '../systems/Pathfinding';
import InteractionManager from '../systems/InteractionManager';
import UIManager from '../systems/UIManager';
import { toWorld, toGrid, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../systems/Grid';
import TimerSystem from '../systems/TimerSystem';
import TaskManager from '../systems/TaskManager';
import { FURNITURE_DATA } from '../data/FurnitureData';

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

    private focusOutline!: Phaser.GameObjects.Image;
    private completedSessions: number = 0;
    private plantSprite: Phaser.GameObjects.Image | null = null;

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

        // 1. Initialize Map
        this.initializeMap();
        this.createMapVisuals();

        // 2. Systems
        this.pathfinding = new Pathfinding();
        this.pathfinding.setup(this.gridMatrix);

        this.uiManager = new UIManager(this);
        this.timerSystem = new TimerSystem();
        this.taskManager = new TaskManager();
        this.setupGameSystems();

        // 3. Furniture
        this.createFurniture();

        // 4. Player
        this.player = new Player(this, toWorld(30), toWorld(25));
        this.player.setTexture('avatar_idle');
        this.objectLayer.add(this.player);

        // 5. Interaction
        this.setupFocusVisuals();

        // 6. Camera
        this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
        this.cameras.main.setZoom(2.0);

        // 7. Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const gx = toGrid(worldPoint.x);
            const gy = toGrid(worldPoint.y);
            this.handleMovementRequest(gx, gy);
        });
    }

    private initializeMap() {
        this.gridMatrix = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            const row: number[] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            this.gridMatrix.push(row);
        }
    }

    private createMapVisuals() {
        // Floor
        const floor = this.add.tileSprite(
            (MAP_WIDTH * TILE_SIZE) / 2,
            (MAP_HEIGHT * TILE_SIZE) / 2,
            MAP_WIDTH * TILE_SIZE,
            MAP_HEIGHT * TILE_SIZE,
            'tile_floor_32'
        );
        this.floorLayer.add(floor);

        // Walls
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            this.addTile('tile_wall_top', x, 0);
            this.addTile('tile_wall_bottom', x, MAP_HEIGHT - 1);
        }
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            this.addTile('tile_wall_left', 0, y);
            this.addTile('tile_wall_right', MAP_WIDTH - 1, y);
        }
        this.addTile('tile_wall_corner_tl', 0, 0);
        this.addTile('tile_wall_corner_tr', MAP_WIDTH - 1, 0);
        this.addTile('tile_wall_corner_bl', 0, MAP_HEIGHT - 1);
        this.addTile('tile_wall_corner_br', MAP_WIDTH - 1, MAP_HEIGHT - 1);

        // Rugs
        for (let rx = 28; rx <= 35; rx++) {
            for (let ry = 18; ry <= 24; ry++) {
                this.addTile('tile_rug_32', rx, ry);
            }
        }

        this.createAtmosphere();
    }

    private createAtmosphere() {
        // Vignette
        const vignette = this.add.image(0, 0, 'fx_vignette')
            .setScrollFactor(0).setAlpha(0.2).setDepth(10);
        vignette.setDisplaySize(this.scale.width, this.scale.height);
        // Center it roughly? Or standard image rules. 
        // Image at 0,0 with origin 0.5 needs adjustment, or setOrigin(0,0).
        vignette.setOrigin(0, 0);
        this.fxLayer.add(vignette);

        // Noise
        const noise = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'fx_noise')
            .setScrollFactor(0).setAlpha(0.05).setBlendMode(Phaser.BlendModes.ADD);
        noise.setOrigin(0, 0);
        this.fxLayer.add(noise);
    }

    private addTile(key: string, gx: number, gy: number) {
        const x = toWorld(gx);
        const y = toWorld(gy);
        const tile = this.add.image(x, y, key);
        this.floorLayer.add(tile);
    }

    private createFurniture() {
        FURNITURE_DATA.forEach(f => {
            f.tilePositions.forEach(pos => {
                if (pos.y >= 0 && pos.y < MAP_HEIGHT && pos.x >= 0 && pos.x < MAP_WIDTH) {
                    this.gridMatrix[pos.y][pos.x] = 1;
                }
            });

            let spriteKey = 'obj_timer_station';
            if (f.id === 'desk') spriteKey = 'obj_timer_station';
            else if (f.id === 'letter_stand') spriteKey = 'obj_task_board';
            else if (f.id === 'sandglass') spriteKey = 'obj_trophy_shelf';
            else if (f.id === 'music_station') spriteKey = 'obj_music_station';
            else if (f.id === 'plant') spriteKey = 'obj_plant_stage0';
            else if (f.id === 'door') spriteKey = 'obj_settings_door';

            if (f.tilePositions.length > 0) {
                const minX = Math.min(...f.tilePositions.map(p => p.x));
                const maxX = Math.max(...f.tilePositions.map(p => p.x));
                const minY = Math.min(...f.tilePositions.map(p => p.y));
                const maxY = Math.max(...f.tilePositions.map(p => p.y));

                const cx = (minX + maxX) / 2;
                const cy = (minY + maxY) / 2;

                const wx = toWorld(cx);
                const wy = toWorld(cy);

                const shadow = this.add.image(wx, wy + 16, 'shadow_oval_big').setAlpha(0.4);
                this.shadowLayer.add(shadow);

                const obj = this.add.image(wx, wy, spriteKey);
                this.objectLayer.add(obj);

                if (f.id === 'plant') this.plantSprite = obj;
            } else if (f.anchors.length > 0) {
                const wx = toWorld(f.anchors[0].x);
                const wy = toWorld(f.anchors[0].y);
                const obj = this.add.image(wx, wy, spriteKey);
                this.objectLayer.add(obj);
            }
        });
    }

    private setupFocusVisuals() {
        this.focusOutline = this.add.image(0, 0, 'ui_focus_outline').setOrigin(0.5).setAlpha(0);
        this.focusLayer.add(this.focusOutline);

        this.interactionManager = new InteractionManager(this, this.player);
        this.interactionManager.onShowOpenButton = (f) => {
            this.uiManager.showOpenButton(f, this.cameras.main);

            let tx = 0, ty = 0;
            if (f.tilePositions.length > 0) {
                const minX = Math.min(...f.tilePositions.map(p => p.x));
                const maxX = Math.max(...f.tilePositions.map(p => p.x));
                const minY = Math.min(...f.tilePositions.map(p => p.y));
                const maxY = Math.max(...f.tilePositions.map(p => p.y));
                tx = (minX + maxX) / 2;
                ty = (minY + maxY) / 2;
            } else if (f.anchors.length > 0) {
                tx = f.anchors[0].x;
                ty = f.anchors[0].y;
            } else {
                return;
            }

            this.focusOutline.setPosition(toWorld(tx), toWorld(ty));
            this.focusOutline.setAlpha(0.8);
            this.tweens.add({
                targets: this.focusOutline,
                alpha: 0.4,
                yoyo: true,
                duration: 600,
                repeat: -1
            });
        };

        this.interactionManager.onHideOpenButton = () => {
            this.uiManager.hideOpenButton();
            this.focusOutline.setAlpha(0);
            this.tweens.killTweensOf(this.focusOutline);
        };
    }

    private setupGameSystems() {
        this.timerSystem.onTick = (remaining) => this.uiManager.updateTimerDisplay(remaining);
        this.timerSystem.onComplete = () => this.handleTimerComplete();

        this.uiManager.onTimerAction = (action) => {
            if (action === 'start') this.timerSystem.startFocus(25);
            else if (action === 'pause') this.timerSystem.pause();
            else if (action === 'resume') this.timerSystem.resume();
            else if (action === 'stop') this.timerSystem.stop();
            else if (action.startsWith('set_')) this.timerSystem.startFocus(parseInt(action.split('_')[1]));
            else if (action === 'reset_data') { localStorage.clear(); location.reload(); }
        };

        this.taskManager.onTasksUpdated = (tasks) => this.uiManager.updateTaskBoard(tasks);
        this.uiManager.onTaskAction = (action, id, status, title) => {
            if (action === 'add' && title) this.taskManager.addTask(title);
            if (action === 'move' && id && status) this.taskManager.moveTask(id, status);
            if (action === 'delete' && id) this.taskManager.deleteTask(id);
        };

        const originalShowPanel = this.uiManager.showPanel.bind(this.uiManager);
        this.uiManager.showPanel = (f) => {
            originalShowPanel(f);
            if (f.type === 'letter') this.uiManager.updateTaskBoard(this.taskManager.getTasks());
        }
    }

    private handleTimerComplete() {
        this.completedSessions++;
        if ((navigator as any).vibrate) (navigator as any).vibrate([200, 100, 200]);
        this.updatePlantGrowth();
    }

    private updatePlantGrowth() {
        if (!this.plantSprite) return;
        let tex = 'obj_plant_stage0';
        if (this.completedSessions >= 3) tex = 'obj_plant_stage1';
        if (this.completedSessions >= 6) tex = 'obj_plant_stage2';
        if (this.completedSessions >= 9) tex = 'obj_plant_stage3';
        this.plantSprite.setTexture(tex);
    }

    private async handleMovementRequest(gx: number, gy: number) {
        const px = toGrid(this.player.x);
        const py = toGrid(this.player.y);
        const path = await this.pathfinding.findPath(px, py, gx, gy);
        if (path && path.length > 0) {
            this.player.followPath(path);
        }
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.interactionManager.update(delta);
    }
}
