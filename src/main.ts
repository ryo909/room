import './style.css';
import Phaser from 'phaser';
import { GameConfig } from './game/config';

window.addEventListener('load', () => {
  new Phaser.Game(GameConfig);
});
