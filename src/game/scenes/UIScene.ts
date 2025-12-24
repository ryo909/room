import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // This scene runs in parallel for HUD
        // Debug overlay hidden by default
    }
}
