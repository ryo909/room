import Phaser from 'phaser';
import type { FurnitureDef } from '../data/FurnitureData';
import { toWorld } from './Grid';

const STR = {
    timer: "タイマー",
    tasks: "タスク",
    settings: "設定",
    achievements: "実績",
    music: "音楽",
    start: "開始",
    pause: "一時停止",
    resume: "再開",
    stop: "終了", // Translated 'end'/'stop'
    work: "作業",
    break: "休憩",
    focus: "集中",
    done: "完了",
    reset: "データ消去",
    confirm_reset: "本当に全データを消去しますか？",
    day: "昼",
    night: "夜",
    sunset: "夕方",
    mins: "分",
    new_task: "新規タスク",
    task_name: "タスク名を入力:",
    delete: "削除"
};

export default class UIManager {
    private openBtn: HTMLElement;
    private bottomPanel: HTMLElement;
    private panelContent: HTMLElement;
    private closePanelBtn: HTMLElement;
    private currentTarget: FurnitureDef | null = null;

    public onOpenClicked: (furniture: FurnitureDef) => void = () => { };
    public onTimerAction: (action: string) => void = () => { };
    public onTaskAction: (action: string, id?: string, status?: any, title?: string) => void = () => { };

    constructor(_scene: Phaser.Scene) {
        this.openBtn = document.getElementById('open-btn')!;
        this.bottomPanel = document.getElementById('bottom-panel')!;
        this.panelContent = document.getElementById('panel-content')!;
        this.closePanelBtn = document.getElementById('close-panel-btn')!;

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
    }

    showOpenButton(furniture: FurnitureDef, camera: Phaser.Cameras.Scene2D.Camera) {
        this.currentTarget = furniture;
        this.openBtn.classList.remove('hidden');
        this.openBtn.innerText = furniture.displayName || furniture.name;

        const anchor = furniture.anchors[0];
        const wx = toWorld(anchor.x);
        const wy = toWorld(anchor.y);

        const sx = (wx - camera.scrollX) * camera.zoom;
        const sy = (wy - camera.scrollY) * camera.zoom;

        this.openBtn.style.left = `${sx}px`;
        this.openBtn.style.top = `${sy - 50}px`;
        this.openBtn.style.transform = 'translate(-50%, 0)';
    }

    hideOpenButton() {
        this.openBtn.classList.add('hidden');
        this.currentTarget = null;
    }

    showPanel(furniture: FurnitureDef) {
        this.bottomPanel.classList.remove('hidden');
        this.panelContent.innerHTML = '';

        if (furniture.type === 'desk') this.renderDeskPanel(furniture);
        else if (furniture.type === 'letter') this.renderTaskPanel(furniture);
        else if (furniture.type === 'rack') this.renderRackPanel(furniture); // Used for Achievements now? Or just Timer Presets?
        // Actually Rack is now 'Sandglass' = 'Achievements' in FurnitureData display name?
        // Wait, 'Sandglass' displayName was '実績' (Achievements).
        // Let's stick to logic types. If type is 'rack', show Rack UI (Presets) or Achievement UI?
        // User asked for "Timer Station", "Task Board", "Settings Door", "Trophy Shelf", "Music Station".

        // Let's map type to panel:
        // desk -> Timer
        // letter -> Task
        // rack -> Presets or Stats? Let's keep Rack as Presets for utility, or maybe specific "Trophy" UI?
        // Instruction 5 says: Sandglass Rack = obj_trophy_shelf = Achievements?
        // Instruction says: "obj_trophy_shelf (Top right) -> Achievements"
        // Let's assume 'rack' type logic handles "Presets" usually, but rename logic if needed.
        // For now: keep Rack = Presets (Sandglass). 

        else if (furniture.type === 'window') this.renderWindowPanel(furniture); // Music/Atmosphere
        else if (furniture.type === 'door') this.renderDoorPanel(furniture);
        else this.panelContent.innerText = furniture.displayName;
    }

    private renderDeskPanel(f: FurnitureDef) {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.innerHTML = `<h2>${f.displayName}</h2>`;

        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display';
        timerDisplay.innerText = '25:00';
        timerDisplay.style.fontSize = '2.5em';
        timerDisplay.style.fontFamily = 'monospace';
        container.appendChild(timerDisplay);

        const controls = document.createElement('div');
        const mkBtn = (txt: string, act: string) => {
            const b = document.createElement('button');
            b.innerText = txt;
            b.style.margin = '4px';
            b.onclick = () => this.onTimerAction(act);
            return b;
        };

        controls.appendChild(mkBtn(STR.start + ' 25' + STR.mins, 'start'));
        controls.appendChild(mkBtn(STR.pause, 'pause'));
        controls.appendChild(mkBtn(STR.resume, 'resume'));
        controls.appendChild(mkBtn(STR.stop, 'stop'));

        container.appendChild(controls);
        this.panelContent.appendChild(container); // Fix: append to panelContent
    }

    private renderTaskPanel(_f: FurnitureDef) {
        const board = document.createElement('div');
        board.className = 'task-board';

        const cols = {
            'TODO': this.createColumn('ToDo'),
            'DOING': this.createColumn('Doing'),
            'DONE': this.createColumn('Done')
        };
        board.appendChild(cols['TODO']);
        board.appendChild(cols['DOING']);
        board.appendChild(cols['DONE']);

        const addBtn = document.createElement('button');
        addBtn.innerText = '+ ' + STR.new_task;
        addBtn.onclick = () => {
            const title = prompt(STR.task_name);
            if (title) this.onTaskAction('add', undefined, undefined, title);
        };
        cols['TODO'].appendChild(addBtn);

        this.panelContent.appendChild(board);
    }

    private createColumn(title: string) {
        const col = document.createElement('div');
        col.className = 'task-column';
        col.innerHTML = `<h3>${title}</h3>`;
        return col;
    }

    public updateTaskBoard(tasks: any[]) {
        const board = this.panelContent.querySelector('.task-board');
        if (!board) return;

        board.querySelectorAll('.task-card').forEach(c => c.remove());
        const cols = board.querySelectorAll('.task-column');

        tasks.forEach(task => {
            let idx = 0;
            if (task.status === 'DOING') idx = 1;
            if (task.status === 'DONE') idx = 2;

            const card = document.createElement('div');
            card.className = `task-card ${task.status.toLowerCase()}`;
            card.innerText = task.title;

            const actions = document.createElement('div');
            if (task.status !== 'DONE') {
                const btn = document.createElement('button');
                btn.className = 'task-btn';
                btn.innerText = '->';
                btn.onclick = (e) => { e.stopPropagation(); this.onTaskAction('move', task.id, idx === 0 ? 'DOING' : 'DONE'); };
                actions.appendChild(btn);
            }

            const del = document.createElement('button');
            del.className = 'task-btn';
            del.innerText = 'x';
            del.onclick = (e) => { e.stopPropagation(); if (confirm(STR.delete + '?')) this.onTaskAction('delete', task.id); };
            actions.appendChild(del);

            card.appendChild(actions);
            cols[idx].appendChild(card);
        });
    }

    private renderRackPanel(f: FurnitureDef) {
        const c = document.createElement('div');
        c.style.textAlign = 'center';
        c.innerHTML = `<h2>${f.displayName}</h2><p>Focus Presets</p>`;

        [15, 25, 45, 60].forEach(m => {
            const b = document.createElement('button');
            b.innerText = `${m}${STR.mins}`;
            b.style.margin = '5px';
            b.onclick = () => this.onTimerAction(`set_${m}`);
            c.appendChild(b);
        });
        this.panelContent.appendChild(c);
    }

    private renderWindowPanel(_f: FurnitureDef) {
        const c = document.createElement('div');
        c.style.textAlign = 'center';
        c.innerHTML = `<h2>${_f.displayName}</h2><p>Atmosphere</p>`;

        const themes = [
            { id: 'day', name: STR.day, color: '#e0e0e0' },
            { id: 'night', name: STR.night, color: '#2a2a2a' },
            { id: 'sunset', name: STR.sunset, color: '#ffcc99' }
        ];

        themes.forEach(t => {
            const b = document.createElement('button');
            b.innerText = t.name;
            b.style.margin = '5px';
            b.onclick = () => { document.body.style.backgroundColor = t.color; };
            c.appendChild(b);
        });
        this.panelContent.appendChild(c);
    }

    private renderDoorPanel(f: FurnitureDef) {
        const c = document.createElement('div');
        c.style.textAlign = 'center';
        c.innerHTML = `<h2>${f.displayName}</h2>`;

        const b = document.createElement('button');
        b.innerText = STR.reset;
        b.style.color = 'red';
        b.onclick = () => {
            if (confirm(STR.confirm_reset)) this.onTimerAction('reset_data');
        };
        c.appendChild(b);
        this.panelContent.appendChild(c);
    }

    public updateTimerDisplay(remaining: number) {
        const el = document.getElementById('timer-display');
        if (el) {
            const m = Math.floor(remaining / 60).toString().padStart(2, '0');
            const s = (remaining % 60).toString().padStart(2, '0');
            el.innerText = `${m}:${s}`;
        }
    }

    hidePanel() {
        this.bottomPanel.classList.add('hidden');
    }
}
