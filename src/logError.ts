export function explainError(
    error: Error,
    header: string,
    maxDepth = 10,
): string {
    const msg: string[] = [];
    msg.push(`👇👇👇👇👇 BEGIN :: ${header} 👇👇👇👇👇`);
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

    msg.push("\n\nStacks");
    for (let error of errors) {
        msg.push(`\n  - ${error.stack}`);
    }

    msg.push(`\n👆👆👆👆👆 END :: ${header} 👆👆👆👆👆`);
    return (
        "\n" +
        msg
            .join("\n")
            .split("\n")
            .map((line) => `>> ${line}`)
            .join("\n") +
        "\n"
    );
}

export function logErrorDetails(
    error: Error,
    header: string,
    maxDepth = 10,
): void {
    console.error(explainError(error, header, maxDepth));
}
