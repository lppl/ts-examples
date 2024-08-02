type TData<T> = {
    data: T;
    isResolved: true;
    isRejected: false;
};
type TError = {
    error: Error;
    isResolved: false;
    isRejected: true;
};
type TResult<T> = TData<T> | TError;
type JobInitiator<T> = () => Promise<T>;
type JobInitiatorList<T> = Array<JobInitiator<T>>;
type JobResults<T, E> = Promise<Array<TResult<T>>>;

export async function batchPromiseRun<T, E>(
    jobs: JobInitiatorList<T>,
    count = 10,
): JobResults<T, E> {
    let resolve;
    const todo = jobs.reverse();
    const current = new Set();
    const result: Array<TResult<T>> = [];
    let isSuccess = true;

    function check() {
        console.log("Check", todo.length, current.size);
        if (todo.length === 0 && current.size === 0) {
            resolve(result);
        } else if (todo.length) {
            add(todo.pop()!);
        }
    }

    function add(job: JobInitiator<T>) {
        const initiated = job();
        current.add(initiated);
        initiated
            .then(
                (data) => resolveJob(job, data),
                (error) => rejectJob(job, error),
            )
            .then(() => {
                current.delete(initiated);
                check(job);
            });
    }
    function resolveJob(job: JobInitiator<T>, data: T) {
        result.push({
            isResolved: true,
            isRejected: false,
            data,
        });
    }

    function rejectJob(job: JobInitiator<T>, error: Error) {
        result.push({
            isResolved: false,
            isRejected: true,
            error,
        });
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
