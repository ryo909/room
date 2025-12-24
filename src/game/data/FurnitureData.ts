export type Anchor = {
    x: number;
    y: number;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
};

export type FurnitureDef = {
    id: string;
    name: string; // Used for key lookups, English ID
    displayName: string; // Japanese label
    type: 'desk' | 'sofa' | 'rack' | 'letter' | 'plant' | 'window' | 'door';
    tilePositions: { x: number, y: number }[];
    anchors: Anchor[];
    proximityRadius: number;
};

// Map size 60x40
// Center approx (30, 20)

export const FURNITURE_DATA: FurnitureDef[] = [
    {
        id: 'desk',
        name: 'Desk',
        displayName: 'タイマー',
        type: 'desk',
        tilePositions: [{ x: 30, y: 20 }, { x: 31, y: 20 }, { x: 30, y: 21 }, { x: 31, y: 21 }],
        anchors: [
            { x: 30, y: 22, direction: 'UP' },
            { x: 31, y: 22, direction: 'UP' }
        ],
        proximityRadius: 2.0
    },
    {
        id: 'letter_stand',
        name: 'Letter Stand',
        displayName: 'タスク',
        type: 'letter',
        tilePositions: [{ x: 33, y: 20 }, { x: 34, y: 20 }], // Near desk
        anchors: [
            { x: 33, y: 21, direction: 'UP' }
        ],
        proximityRadius: 1.8
    },
    {
        id: 'sandglass',
        name: 'Sandglass',
        displayName: '実績', // Changed to Trophy/Achievement as per "Trophy Shelf"
        type: 'rack',
        tilePositions: [{ x: 40, y: 8 }], // Top right area
        anchors: [
            { x: 40, y: 9, direction: 'UP' }
        ],
        proximityRadius: 1.8
    },
    {
        id: 'music_station',
        name: 'Music Station',
        displayName: '音楽',
        type: 'window', // Reuse 'window' type logic for atmosphere
        tilePositions: [{ x: 5, y: 5 }], // Top left
        anchors: [
            { x: 6, y: 6, direction: 'UP' }
        ],
        proximityRadius: 1.8
    },
    {
        id: 'plant',
        name: 'Plant',
        displayName: '植物',
        type: 'plant',
        tilePositions: [{ x: 50, y: 30 }], // Bottom right
        anchors: [
            { x: 49, y: 30, direction: 'RIGHT' }
        ],
        proximityRadius: 1.8
    },
    {
        id: 'door',
        name: 'Door',
        displayName: '設定',
        type: 'door',
        tilePositions: [],
        anchors: [
            { x: 2, y: 35, direction: 'LEFT' } // Bottom left entrance
        ],
        proximityRadius: 2.0
    }
];
