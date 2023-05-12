"use strict";
{
    class X {}
    class Y extends X {}

    class Z {}

    const o = Object.freeze(new Y());

    console.log({
        isX: o instanceof X,
        isY: o instanceof Y,
        isZ: o instanceof Z,
    });
}
