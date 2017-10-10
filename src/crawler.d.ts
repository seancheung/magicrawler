declare module 'crawler' {
    type Callback = (err: string, res: any, done: () => void) => void;
    type Task = {uri: string, callback: Callback};
    class Crawler {
        constructor(options: any);
        queue(task: Task): void;
        on(event: string, callback: () => void): void;
    }
    export = Crawler;
}