import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets needed for the loading screen (logo, etc.) if any
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
