import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // This scene runs in parallel for HUD
        this.add.text(10, 460, 'UI Overlay', { fontSize: '12px', color: '#ffffff' });
    }
}
