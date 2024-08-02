type TData<T> = {
    data: T;
    durationMs: number;
    isResolved: true;
    isRejected: false;
};
type TError = {
    error: Error;
    durationMs: number;
    isResolved: false;
    isRejected: true;
};
type TResult<T> = TData<T> | TError;
type JobInitiator<T> = () => Promise<T>;
type JobInitiatorList<T> = Array<JobInitiator<T>>;
type JobResults<T> = Promise<Array<TResult<T>>>;

type Foobar<T> = {
    job: JobInitiator<T>;
    i: number;
    startMs: number;
};
export async function batchPromiseRun<T>(
    jobs: JobInitiatorList<T>,
    count = 10,
): JobResults<T> {
    let resolve = (_: Array<TResult<T>>) => {};
    const todo = jobs.map((job, i) => ({ job, i, startMs: -1 })).reverse();
    const current = new Set();
    const result: Array<TResult<T>> = new Array(jobs.length);

    function check() {
        if (todo.length === 0 && current.size === 0) {
            resolve(result);
        } else if (todo.length) {
            add(todo.pop()!);
        }
    }

    function add(job: Foobar<T>) {
        const initiated = job.job();
        job.startMs = Date.now();
        current.add(job);
        initiated
            .then(
                (data) => resolveJob(job, data),
                (error) => rejectJob(job, error),
            )
            .then(() => {
                current.delete(job);
                check();
            });
    }
    function resolveJob(job: Foobar<T>, data: T) {
        result[job.i] = {
            isResolved: true,
            isRejected: false,
            durationMs: Date.now() - job.startMs,
            data,
        };
    }

    function rejectJob(job: Foobar<T>, error: Error) {
        result[job.i] = {
            isResolved: false,
            isRejected: true,
            durationMs: Date.now() - job.startMs,
            error,
        };
    }

    for (let i = 0; i < count; i++) {
        if (todo.length) {
            add(todo.pop()!);
        }
    }

    return new Promise((_resolve) => {
        resolve = _resolve;
    });
}
