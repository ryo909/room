import Phaser from 'phaser';
import Player from '../objects/Player';
import { FURNITURE_DATA } from '../data/FurnitureData';
import type { FurnitureDef } from '../data/FurnitureData';
import { toWorld } from './Grid';

export default class InteractionManager {
    private player: Player;
    private currentFocus: FurnitureDef | null = null;
    private currentScore: number = 0;
    private candidateStableTime: number = 0;
    private showOpenButtonTimer: number | null = null;

    // Events
    public onShowOpenButton: (furniture: FurnitureDef) => void = () => { };
    public onHideOpenButton: () => void = () => { };

    constructor(_scene: Phaser.Scene, player: Player) {
        this.player = player;
    }

    update(delta: number) {
        if ((this.player as any).isMoving) {
            this.clearFocus();
            return;
        }

        // Find best candidate
        let bestCandidate: FurnitureDef | null = null;
        let bestScore = -1;

        FURNITURE_DATA.forEach(furniture => {
            // Check proximity center to center (approx)
            // Better: check distance to closest anchor? Or center?
            // Spec: "Proximity radius"
            // Let's use the first anchor (Primary) as the reference point for simple distance check,
            // or the center of the furniture.
            // Furniture positions are in tiles.

            // Simplification: Check distance to Primary Anchor logic for scoring?
            // Spec 4.2: Distance d, Front alignment a.

            const anchors = furniture.anchors;
            let minD = Infinity;

            anchors.forEach(anchor => {
                const ax = toWorld(anchor.x);
                const ay = toWorld(anchor.y);
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, ax, ay) / 32; // distance in tiles

                if (d < furniture.proximityRadius) {
                    // Calculate alignment 'a' (dot product of player forward and vector to anchor?)
                    // Actually spec says "Front Alignment a". 
                    // If player is facing UP, and anchor is Direction UP, it means player should look UP to see it?
                    // Or "Approaching object" so player faces object.
                    // Let's assume 'a' is 1.0 if player is facing the anchor.

                    // Player current facing? We don't track facing explicitly yet in Player... 
                    // but we know movement direction. 
                    // When stopped, we need facing.

                    // For now, let's use distance only or simple facing assumption.
                    // If d is small enough.

                    if (d < minD) minD = d;
                }
            });

            if (minD < Infinity) {
                // Calculate Score
                // Sd = 1 / (d + 0.35)
                const Sd = 1 / (minD + 0.35);
                const Sa = 0.6; // Placeholder for alignment
                const score = Sd * Sa;

                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = furniture;
                }
            }
        });

        // Hysteresis
        if (this.currentFocus && bestCandidate !== this.currentFocus) {
            if (bestCandidate && bestScore > this.currentScore * 1.15) {
                this.candidateStableTime += delta;
                if (this.candidateStableTime > 150) {
                    this.setFocus(bestCandidate, bestScore);
                }
            } else if (!bestCandidate) {
                // Lost focus
                this.clearFocus();
            }
        } else if (bestCandidate && !this.currentFocus) {
            this.candidateStableTime += delta;
            if (this.candidateStableTime > 150) {
                this.setFocus(bestCandidate, bestScore);
            }
        } else if (bestCandidate === this.currentFocus) {
            // Update score
            this.currentScore = bestScore;
            this.candidateStableTime = 0;
        }
    }

    private setFocus(furniture: FurnitureDef, score: number) {
        this.currentFocus = furniture;
        this.currentScore = score;
        this.candidateStableTime = 0;

        // Highlight effect (gold outline) - emit event or handle here?
        // Show "Open" button delayed
        if (this.showOpenButtonTimer) {
            clearTimeout(this.showOpenButtonTimer);
        }
        this.showOpenButtonTimer = setTimeout(() => {
            this.onShowOpenButton(furniture);
        }, 200) as unknown as number;
    }

    private clearFocus() {
        if (this.currentFocus) {
            this.currentFocus = null;
            this.currentScore = 0;
            this.candidateStableTime = 0;
            if (this.showOpenButtonTimer) {
                clearTimeout(this.showOpenButtonTimer);
                this.showOpenButtonTimer = null;
            }
            this.onHideOpenButton();
        }
    }
}
