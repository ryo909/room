export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface TaskItem {
    id: string;
    title: string;
    status: TaskStatus;
    order: number;
}

export default class TaskManager {
    private tasks: TaskItem[] = [];

    // Callbacks
    public onTasksUpdated: (tasks: TaskItem[]) => void = () => { };

    constructor() {
        // Initial dummy data
        this.addTask('Check Emails');
        this.addTask('Write Report');
        this.addTask('Plan Tomorrow');
    }

    getTasks(): TaskItem[] {
        return [...this.tasks].sort((a, b) => a.order - b.order);
    }

    addTask(title: string) {
        if (this.tasks.length >= 7) return; // Max 7 limit

        const newTask: TaskItem = {
            id: crypto.randomUUID(),
            title: title.substring(0, 32),
            status: 'TODO',
            order: this.tasks.length
        };
        this.tasks.push(newTask);
        this.notify();
    }

    moveTask(id: string, newStatus: TaskStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            // If DOING, maybe ensure only one is DOING? Spec implies "Doing" slot.
            // "L-3 (ToDo/Doing/Done) UI"
            // Usually one active task.
            if (newStatus === 'DOING') {
                // Demote other DOING tasks to TODO or keep multiple?
                // Spec 6.1: "Display: Current Doing Task Name"
                // This implies singular focus.
                this.tasks.forEach(t => {
                    if (t.id !== id && t.status === 'DOING') {
                        t.status = 'TODO'; // Auto-demote
                    }
                });
            }
            this.notify();
        }
    }

    deleteTask(id: string) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.notify();
    }

    // Get the current active task for Desk
    getCurrentTask(): TaskItem | undefined {
        return this.tasks.find(t => t.status === 'DOING');
    }

    private notify() {
        this.onTasksUpdated(this.getTasks());
    }
}
