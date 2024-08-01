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
type JobInitiators<T> = Array<() => Promise<T>>;
type JobResults<T, E> = Promise<Array<TResult<T>>>;

export async function batchPromiseRun<T, E>(
    jobs: JobInitiators<T>,
): JobResults<T, E> {
    return Promise.all(
        jobs.map((job, jobIndex) =>
            job().then(
                (data) =>
                    ({
                        data,
                        isResolved: true,
                        isRejected: false,
                    } satisfies TResult<T>),
                (error: Error) =>
                    ({
                        error,
                        isResolved: false,
                        isRejected: true,
                    } satisfies TResult<T>),
            ),
        ),
    );
}
