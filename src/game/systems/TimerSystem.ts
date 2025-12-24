export type TimerState = 'IDLE' | 'FOCUS' | 'PAUSED' | 'BREAK';

export default class TimerSystem {
    private state: TimerState = 'IDLE';
    private remainingSeconds: number = 0;
    private totalSeconds: number = 25 * 60;
    private timer: number | null = null;

    // Callbacks
    public onTick: (remaining: number, total: number) => void = () => { };
    public onStateChange: (state: TimerState) => void = () => { };
    public onComplete: () => void = () => { };

    startFocus(minutes: number = 25) {
        this.state = 'FOCUS';
        this.totalSeconds = minutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.startTicker();
        this.onStateChange(this.state);
        this.onTick(this.remainingSeconds, this.totalSeconds);
    }

    startBreak(minutes: number = 5) {
        this.state = 'BREAK';
        this.totalSeconds = minutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.startTicker();
        this.onStateChange(this.state);
        this.onTick(this.remainingSeconds, this.totalSeconds);
    }

    pause() {
        if (this.state === 'FOCUS') {
            this.state = 'PAUSED';
            this.stopTicker();
            this.onStateChange(this.state);
        }
    }

    resume() {
        if (this.state === 'PAUSED') {
            this.state = 'FOCUS';
            this.startTicker();
            this.onStateChange(this.state);
        }
    }

    stop() {
        this.state = 'IDLE';
        this.stopTicker();
        this.remainingSeconds = this.totalSeconds;
        this.onStateChange(this.state);
    }

    private startTicker() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.remainingSeconds--;
            this.onTick(this.remainingSeconds, this.totalSeconds);

            if (this.remainingSeconds <= 0) {
                this.complete();
            }
        }, 1000) as unknown as number;
    }

    private stopTicker() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private complete() {
        this.stopTicker();
        this.state = 'IDLE'; // Or 'COMPLETED' before Break?
        // Spec: "Completion Effect" -> Then user chooses Break or Next.
        this.onComplete();
    }
}
