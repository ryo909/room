export type Anchor = {
    x: number;
    y: number;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
};

export type FurnitureDef = {
    id: string;
    name: string;
    type: 'desk' | 'sofa' | 'rack' | 'letter' | 'plant' | 'window' | 'door';
    tilePositions: { x: number, y: number }[]; // Occupied tiles
    anchors: Anchor[]; // Ordered list (Primary, Secondary...)
    proximityRadius: number;
};

export const FURNITURE_DATA: FurnitureDef[] = [
    {
        id: 'desk',
        name: 'Desk',
        type: 'desk',
        tilePositions: [{ x: 9, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 7 }, { x: 10, y: 7 }],
        anchors: [
            { x: 9, y: 8, direction: 'UP' },
            { x: 10, y: 8, direction: 'UP' },
            { x: 8, y: 7, direction: 'RIGHT' },
            { x: 11, y: 7, direction: 'LEFT' }
        ],
        proximityRadius: 1.6
    },
    {
        id: 'sofa',
        name: 'Sofa',
        type: 'sofa',
        tilePositions: [{ x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 15, y: 7 }, { x: 16, y: 7 }, { x: 17, y: 7 }],
        anchors: [
            { x: 16, y: 8, direction: 'UP' },
            { x: 14, y: 7, direction: 'RIGHT' },
            { x: 18, y: 7, direction: 'LEFT' },
            { x: 16, y: 5, direction: 'DOWN' }
        ],
        proximityRadius: 1.6
    },
    {
        id: 'sandglass',
        name: 'Sandglass',
        type: 'rack',
        tilePositions: [{ x: 12, y: 8 }],
        anchors: [
            { x: 12, y: 9, direction: 'UP' },
            { x: 11, y: 9, direction: 'RIGHT' },
            { x: 13, y: 9, direction: 'LEFT' },
            { x: 12, y: 10, direction: 'UP' }
        ],
        proximityRadius: 1.6
    },
    {
        id: 'letter_stand',
        name: 'Letter Stand',
        type: 'letter',
        tilePositions: [{ x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 12 }],
        anchors: [
            { x: 7, y: 13, direction: 'UP' },
            { x: 6, y: 13, direction: 'UP' },
            { x: 8, y: 13, direction: 'UP' },
            { x: 7, y: 11, direction: 'DOWN' }
        ],
        proximityRadius: 1.6
    },
    {
        id: 'plant',
        name: 'Plant',
        type: 'plant',
        tilePositions: [{ x: 14, y: 9 }],
        anchors: [
            { x: 14, y: 10, direction: 'UP' },
            { x: 13, y: 10, direction: 'RIGHT' },
            { x: 15, y: 10, direction: 'LEFT' },
            { x: 14, y: 11, direction: 'UP' }
        ],
        proximityRadius: 1.6
    },
    // Window and Door are special visual walls, but actionable.
    {
        id: 'window',
        name: 'Window',
        type: 'window',
        tilePositions: [], // No floor occupation
        anchors: [
            { x: 10, y: 2, direction: 'UP' },
            { x: 9, y: 2, direction: 'UP' },
            { x: 11, y: 2, direction: 'UP' },
            { x: 10, y: 3, direction: 'UP' }
        ],
        proximityRadius: 1.2
    },
    {
        id: 'door',
        name: 'Door',
        type: 'door',
        tilePositions: [], // No floor occupation
        anchors: [
            { x: 2, y: 12, direction: 'LEFT' },
            { x: 2, y: 11, direction: 'LEFT' },
            { x: 2, y: 13, direction: 'LEFT' },
            { x: 3, y: 12, direction: 'LEFT' }
        ],
        proximityRadius: 1.2
    }
];
