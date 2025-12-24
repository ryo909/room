import Phaser from 'phaser';
import type { FurnitureDef } from '../data/FurnitureData';
import { toWorld } from './Grid';

export default class UIManager {
    private openBtn: HTMLElement;
    private bottomPanel: HTMLElement;
    private panelContent: HTMLElement;
    private closePanelBtn: HTMLElement;
    private currentTarget: FurnitureDef | null = null;

    // Callbacks
    public onOpenClicked: (furniture: FurnitureDef) => void = () => { };

    constructor(_scene: Phaser.Scene) {

        // Get Elements
        this.openBtn = document.getElementById('open-btn')!;
        this.bottomPanel = document.getElementById('bottom-panel')!;
        this.panelContent = document.getElementById('panel-content')!;
        this.closePanelBtn = document.getElementById('close-panel-btn')!;

        // Bind Events
        this.openBtn.addEventListener('click', () => {
            if (this.currentTarget) {
                this.onOpenClicked(this.currentTarget);
                this.showPanel(this.currentTarget);
                this.hideOpenButton();
            }
        });

        this.closePanelBtn.addEventListener('click', () => {
            this.hidePanel();
        });

        // Mobile handling for "Long Press" (Window/Door)
        // TODO: implement long press logic
    }

    showOpenButton(furniture: FurnitureDef, camera: Phaser.Cameras.Scene2D.Camera) {
        this.currentTarget = furniture;
        this.openBtn.classList.remove('hidden');

        // Position button near furniture (World -> Screen)
        // Use Primary Anchor or Center
        // furniture.tilePositions centered?
        // Use first tile of furniture for now + offset ?
        // Or use Primary Anchor
        const anchor = furniture.anchors[0];
        const wx = toWorld(anchor.x);
        const wy = toWorld(anchor.y);

        // Manual world to screen conversion (assuming no rotation/zoom for now or simple zoom)
        const sx = (wx - camera.scrollX) * camera.zoom;
        const sy = (wy - camera.scrollY) * camera.zoom;

        // Minimal impl: Fixed Button at bottom center for simplicity as per "Smartphone" standard?
        // "Open" button appearing 200ms after stop.
        // Let's place it near the object to be contextual.

        this.openBtn.style.left = `${sx}px`;
        this.openBtn.style.top = `${sy - 40}px`; // Above object
    }

    hideOpenButton() {
        this.openBtn.classList.add('hidden');
        this.currentTarget = null;
    }

    private renderSofaPanel() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.innerHTML = '<h2>Sofa - Rest</h2><p>Take a break between sessions.</p>';

        const btn5 = document.createElement('button');
        btn5.innerText = 'Start 5m Break';
        btn5.onclick = () => this.onTimerAction('break_5');

        const btn15 = document.createElement('button');
        btn15.innerText = 'Start 15m Long Break';
        btn15.onclick = () => this.onTimerAction('break_15');

        container.appendChild(btn5);
        container.appendChild(btn15);

        this.panelContent.appendChild(container); // Fix: Append to panelContent, not container
    }

    private renderRackPanel() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.innerHTML = '<h2>Sandglass Rack</h2><p>Select Focus Duration</p>';

        [15, 25, 45, 60].forEach(min => {
            const btn = document.createElement('button');
            btn.innerText = `${min} mins`;
            btn.style.margin = '5px';
            btn.onclick = () => this.onTimerAction(`set_${min}` as any);
            container.appendChild(btn);
        });

        this.panelContent.appendChild(container);
    }

    // Callback
    // Update type to include new actions
    public onTimerAction: (action: 'start' | 'pause' | 'resume' | 'stop' | 'break_5' | 'break_15' | 'set_15' | 'set_25' | 'set_45' | 'set_60' | 'reset_data') => void = () => { };
    public onTaskAction: (action: 'add' | 'move' | 'delete', id?: string, status?: any, title?: string) => void = () => { };

    showPanel(furniture: FurnitureDef) {
        this.bottomPanel.classList.remove('hidden');
        this.panelContent.innerHTML = ''; // Clear previous

        if (furniture.type === 'desk') {
            this.renderDeskPanel();
        } else if (furniture.type === 'letter') {
            this.renderTaskPanel();
        } else if (furniture.type === 'sofa') {
            this.renderSofaPanel();
        } else if (furniture.type === 'rack') {
            this.renderRackPanel();
        } else if (furniture.type === 'door') {
            this.renderDoorPanel();
        } else if (furniture.type === 'window') {
            this.renderWindowPanel();
        } else {
            this.panelContent.innerText = `Accessing ${furniture.name}... (Feature coming in Phase 2)`;
        }
    }

    private renderWindowPanel() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.innerHTML = '<h2>Window</h2><p>Change Atmosphere</p>';

        const themes = [
            { id: 'day', name: 'Day', color: '#e0e0e0' },
            { id: 'night', name: 'Night', color: '#2a2a2a' },
            { id: 'sunset', name: 'Sunset', color: '#ffcc99' }
        ];

        themes.forEach(theme => {
            const btn = document.createElement('button');
            btn.innerText = theme.name;
            btn.style.margin = '5px';
            btn.onclick = () => {
                document.body.style.backgroundColor = theme.color;
                // Optional: Notify game logic if needed
            };
            container.appendChild(btn);
        });

        this.panelContent.appendChild(container);
    }

    private renderDoorPanel() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.innerHTML = '<h2>Settings</h2><p>Manage your data.</p>';

        const resetBtn = document.createElement('button');
        resetBtn.innerText = 'Reset All Data';
        resetBtn.style.color = '#ff4444';
        resetBtn.style.borderColor = '#ff4444';
        resetBtn.onclick = () => {
            if (confirm('Are you sure? This will wipe all tasks and progress.')) {
                this.onTimerAction('reset_data' as any);
            }
        };
        container.appendChild(resetBtn);

        container.appendChild(document.createElement('hr'));

        const about = document.createElement('p');
        about.style.fontSize = '0.8em';
        about.style.color = '#888';
        about.innerText = 'Hakoniwa Shosai v0.1.0\nPhase 3 Build';
        container.appendChild(about);

        this.panelContent.appendChild(container);
    }

    private renderTaskPanel() {
        const board = document.createElement('div');
        board.className = 'task-board';

        // Columns
        const cols = {
            'TODO': this.createColumn('ToDo'),
            'DOING': this.createColumn('Doing'),
            'DONE': this.createColumn('Done')
        };

        board.appendChild(cols['TODO']);
        board.appendChild(cols['DOING']);
        board.appendChild(cols['DONE']);

        // Add Task Button (in ToDo column)
        const addBtn = document.createElement('button');
        addBtn.innerText = '+ New Task';
        addBtn.onclick = () => {
            const title = prompt("New Task Name:");
            if (title) this.onTaskAction('add', undefined, undefined, title);
        };
        cols['TODO'].appendChild(addBtn);

        this.panelContent.appendChild(board);
    }

    private createColumn(title: string) {
        const col = document.createElement('div');
        col.className = 'task-column';
        const h = document.createElement('h3');
        h.innerText = title;
        col.appendChild(h);
        return col;
    }

    public updateTaskBoard(tasks: any[]) {
        const board = this.panelContent.querySelector('.task-board');
        if (!board) return;

        // Clear tasks from columns
        board.querySelectorAll('.task-column').forEach((col) => {
            const cards = col.querySelectorAll('.task-card');
            cards.forEach(c => c.remove());
        });

        const cols = board.querySelectorAll('.task-column');

        tasks.forEach(task => {
            let colIndex = 0;
            if (task.status === 'DOING') colIndex = 1;
            if (task.status === 'DONE') colIndex = 2;

            const card = document.createElement('div');
            card.className = `task-card ${task.status.toLowerCase()}`;

            const span = document.createElement('span');
            span.innerText = task.title;
            card.appendChild(span);

            const actions = document.createElement('div');

            if (task.status === 'TODO') {
                const btn = document.createElement('button');
                btn.className = 'task-btn';
                btn.innerText = 'Go';
                btn.onclick = (e) => { e.stopPropagation(); this.onTaskAction('move', task.id, 'DOING'); };
                actions.appendChild(btn);
            } else if (task.status === 'DOING') {
                const btn = document.createElement('button');
                btn.className = 'task-btn';
                btn.innerText = 'Done';
                btn.onclick = (e) => { e.stopPropagation(); this.onTaskAction('move', task.id, 'DONE'); };
                actions.appendChild(btn);
            }

            const del = document.createElement('button');
            del.className = 'task-btn';
            del.innerText = 'x';
            del.onclick = (e) => { e.stopPropagation(); if (confirm('Delete?')) this.onTaskAction('delete', task.id); };
            actions.appendChild(del);

            card.appendChild(actions);

            if (colIndex === 0) {
                const addBtn = cols[0].querySelector('button');
                if (addBtn) cols[0].insertBefore(card, addBtn);
                else cols[0].appendChild(card);
            } else {
                cols[colIndex].appendChild(card);
            }
        });
    }

    private renderDeskPanel() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.innerText = 'Desk - Focus';
        container.appendChild(title);

        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display';
        timerDisplay.innerText = '25:00';
        timerDisplay.style.fontSize = '2em';
        timerDisplay.style.fontFamily = 'monospace';
        container.appendChild(timerDisplay);

        const controls = document.createElement('div');

        const startBtn = document.createElement('button');
        startBtn.innerText = 'Start 25m';
        startBtn.onclick = () => this.onTimerAction('start');

        const pauseBtn = document.createElement('button');
        pauseBtn.innerText = 'Pause';
        pauseBtn.onclick = () => this.onTimerAction('pause');

        const resumeBtn = document.createElement('button');
        resumeBtn.innerText = 'Resume';
        resumeBtn.onclick = () => this.onTimerAction('resume');

        const stopBtn = document.createElement('button');
        stopBtn.innerText = 'Stop';
        stopBtn.onclick = () => this.onTimerAction('stop');

        controls.appendChild(startBtn);
        controls.appendChild(pauseBtn);
        controls.appendChild(resumeBtn);
        controls.appendChild(stopBtn);

        container.appendChild(controls);
        this.panelContent.appendChild(container);
    }

    public updateTimerDisplay(remaining: number) {
        const display = document.getElementById('timer-display');
        if (display) {
            const m = Math.floor(remaining / 60).toString().padStart(2, '0');
            const s = (remaining % 60).toString().padStart(2, '0');
            display.innerText = `${m}:${s}`;
        }
    }

    hidePanel() {
        this.bottomPanel.classList.add('hidden');
    }
}
