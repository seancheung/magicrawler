declare module 'crawler' {
    interface Options  {
        autoWindowClose: boolean,
        forceUTF8: boolean,
        gzip: boolean,
        incomingEncoding: string,
        jQuery: boolean,
        maxConnections: number,
        method: string,
        priority: number,
        priorityRange: number,
        rateLimit: number,
        referer: boolean,
        retries: number,
        retryTimeout: number,
        timeout: number,
        skipDuplicates: boolean,
        rotateUA: boolean,
        homogeneous: boolean,
        userAgent: string
    }
    type Callback = (err: string, res: any, done: () => void) => void;
    type Task = {uri: string, callback: Callback};
    class Crawler {
        constructor(options: Options);
        queue(task: Task): void;
        on(event: string, callback: () => void): void;
    }
    export = Crawler;
}