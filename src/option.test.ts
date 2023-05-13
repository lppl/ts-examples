import { None, Option, Some } from "./option";

const someVar = Some("Foobar");
const noneVar = None<string>();

test("Option", () => {
    const x: string | undefined = "Its alive";
    const y: string | undefined = undefined;

    expect(Option(x).unwrap()).toBe("Its alive");
    expect(
        Option(y)
            .else(() => "Can be undefined")
            .unwrap(),
    ).toBe("Can be undefined");
});

test("", () => {
    expect(someVar.and((str) => `Hello ${str}`).value("_")).toBe(
        "Hello Foobar",
    );
});

test("", () => {
    expect(noneVar.value("_")).toBe("_");
});

test("", () => {
    expect(
        noneVar
            .else(() => "Foobar")
            .and((str) => `Hello ${str}`)
            .value("_"),
    ).toBe("Hello Foobar");
});

test("", () => {
    expect(
        noneVar.match(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
    ).toBe("None var found");
});

test("", () => {
    expect(
        someVar.match(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
    ).toBe("Found string Foobar");
});

test("", () => {
    expect(someVar.and((str) => `Hello ${str}`).value("_")).toBe(
        "Hello Foobar",
    );
});

test("Some can flatten Some", () => {
    expect(Some(Some(Some("Roll it out"))).value("did not work")).toBe(
        "Roll it out",
    );
});

test("Some can flatten None", () => {
    expect(Some(Some(None())).value("None also works")).toBe("None also works");
});
