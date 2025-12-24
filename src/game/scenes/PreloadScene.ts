import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Generate placeholder textures programmatically to avoid external assets for now

        // 1. Grid Tile (32x32)
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // Floor (Beige/Wood)
        graphics.fillStyle(0xe0cda9);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0xc0a080);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);
        graphics.clear();

        // Wall (Dark Wood)
        graphics.fillStyle(0x5c4033);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x3d2b1f);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('wall', 32, 32);
        graphics.clear();

        // Player (Circle)
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 12);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        // Furniture Textures (Placeholders)
        // Desk (2x2) - 64x64
        graphics.fillStyle(0x8b4513); // SaddleBrown
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('desk', 64, 64);
        graphics.clear();

        // Sofa (3x2) - 96x64
        graphics.fillStyle(0x4682b4); // SteelBlue
        graphics.fillRect(0, 0, 96, 64);
        graphics.generateTexture('sofa', 96, 64);
        graphics.clear();

        // Letter Stand (3x1) - 96x32
        graphics.fillStyle(0xd2b48c); // Tan
        graphics.fillRect(0, 0, 96, 32);
        graphics.generateTexture('letter_stand', 96, 32);
        graphics.clear();

        // Sandglass Rack (1x1) - 32x32
        graphics.fillStyle(0xffd700); // Gold
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('sandglass', 32, 32);
        graphics.clear();

        // Plant (1x1) - 32x32
        graphics.fillStyle(0x228b22); // ForestGreen
        graphics.fillCircle(16, 16, 14);
        graphics.generateTexture('plant', 32, 32);
        graphics.clear();

        // Door/Window will be treated as visual markers on walls for now
    }

    create() {
        this.scene.start('MainScene');
        this.scene.start('UIScene'); // Overlay UI
    }
}
