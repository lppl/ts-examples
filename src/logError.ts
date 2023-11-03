export function explainError(
    error: Error,
    header: string,
    maxDepth = 10,
): string {
    const msg: string[] = [];
    msg.push(`\n🔥🔥🔥🔥 ${header} 🔥🔥🔥🔥`);
    const errors: Error[] = [];
    let current = error;
    let i = maxDepth;
    do {
        errors.push(current);
        current = current?.cause as Error;
    } while (--i > 0 && current);

    msg.push("\nCause chain\n");
    for (let error of errors) {
        msg.push(`  - 🧨 ${error}`);
    }

    msg.push("\n\nStacks\n");
    for (let error of errors) {
        msg.push(`  - ${error.stack}`);
    }

    msg.push(`\n🔥🔥🔥🔥 ${header} 🔥🔥🔥🔥\n`);
    return msg.join("\n");
}

export function logErrorDetails(
    error: Error,
    header: string,
    maxDepth = 10,
): void {
    console.error(explainError(error, header, maxDepth));
}
