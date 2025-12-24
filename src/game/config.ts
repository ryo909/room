import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainScene from './scenes/MainScene';
import UIScene from './scenes/UIScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 640, // 20 * 32
    height: 480, // 15 * 32
    backgroundColor: '#1a1a1a', // Dark background for "Quiet" feel
    parent: 'game-container',
    pixelArt: true, // For crisp pixel art style
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 }
        }
    },
    scene: [BootScene, PreloadScene, MainScene, UIScene]
};
