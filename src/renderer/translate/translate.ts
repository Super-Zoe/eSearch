import xtranslator, { matchFitLan } from "xtranslator";
import { getImgUrl, initStyle } from "../root/root";
const fs = require("node:fs") as typeof import("fs");

import store from "../../../lib/store/renderStore";

import {
    button,
    ele,
    frame,
    image,
    p,
    pureStyle,
    spacer,
    txt,
    view,
} from "dkh-ui";

pureStyle();

initStyle(store);

// @auto-path:../assets/icons/$.svg
function iconButton(img: string) {
    return button(
        image(getImgUrl(`${img}.svg`), "icon")
            .class("icon")
            .style({ width: "100%", height: "100%" }),
    ).style({
        position: "relative",
    });
}

const input = ele("textarea").style({
    width: "100%",
    padding: "8px",
    resize: "vertical",
    // @ts-ignore
    "field-sizing": "content",
    "min-height": "4lh",
});
const lans = view("x");
const lansFrom = ele("select").on("change", () => {
    translate(input.el.value);
});
const lansTo = ele("select").on("change", () => {
    translate(input.el.value);
});

const results = view("y").style({
    gap: "16px",
    padding: "8px",
    overflow: "auto",
});

lans.add([lansFrom, lansTo]);

input.addInto();
lans.addInto();
results.addInto();

type saveData = {
    from: string;
    to: string;
    fromT: string;
    toT: string;
    engine: string;
};

function translate(_text: string) {
    results.el.innerHTML = "";
    const text = _text.trim();
    if (!text) return;

    const fromLan = lansFrom.el.value;
    const toLan = lansTo.el.value;

    for (const i of fyq) {
        const copy = iconButton("copy").style({
            width: "24px",
            height: "24px",
        });
        const save = iconButton("star").style({
            width: "24px",
            height: "24px",
            display:
                showCang.fetch.length && showCang.文件.length
                    ? "block"
                    : "none",
        });
        const reTry = iconButton("reload")
            .style({
                width: "24px",
                height: "24px",
            })
            .on("click", () => {
                f();
            });
        const checkEl = iconButton("replace").style({
            width: "24px",
            height: "24px",
            display: lansFrom.el.value === "zh-xxx" ? "" : "none", // todo === 母语
        });
        const e = frame(`result${i.id}`, {
            _: view().style({ width: "100%" }),
            title: {
                _: view("x").style({ "align-items": "center" }),
                _spacer: spacer(),
                name: txt(i.name).style({ "margin-right": "4px" }),
                copy,
                save,
                reTry,
                checkEl,
            },
            content: p(""),
        });
        results.add(e.el);
        const c = e.els.content;
        const f = () =>
            fanyiqi
                .get(i.id)
                // @ts-ignore
                .run(text, fromLan, toLan)
                .then((_ttext: string) => {
                    const ttext = _ttext.trim();
                    c.el.innerText = ttext;
                    copy.on("click", () => {
                        navigator.clipboard.writeText(ttext);
                    });
                    save.on("click", () => {
                        saveW({
                            from: fromLan,
                            to: toLan,
                            fromT: text,
                            toT: ttext,
                            engine: i.name,
                        });
                    });
                    checkEl.on("click", async () => {
                        // @ts-ignore
                        const t = await fanyiqi.get(i.id).run(
                            text,
                            toLan,
                            "zh", // todo 识别后的语言，因为有可能是自动
                        );
                        c.el.innerText += `\n${t}`;
                    });
                })
                .catch((err) => {
                    console.error(err);
                    c.el.innerText = "翻译失败，请重试";
                });
        f();
    }
    const cl = c常用语言.filter((i) => i !== fromLan && i !== toLan);
    store.set(
        "翻译.常用语言",
        [toLan, fromLan, ...cl].filter((i) => i !== "auto"),
    );
}

function saveW(obj: saveData) {
    saveFile(obj);
    saveFetch(obj);
}

function saveTemplate(t: string, obj: saveData) {
    return t
        .replaceAll("${from}", obj.from)
        .replaceAll("${to}", obj.to)
        .replaceAll("${fromT}", obj.fromT)
        .replaceAll("${toT}", obj.toT)
        .replaceAll("${engine}", obj.engine);
}

function saveFile(obj: saveData) {
    const filesx = showCang.文件;
    for (const i of filesx) {
        fs.appendFile(i.path, `\n${saveTemplate(i.template, obj)}`, () => {});
    }
}

function saveFetch(obj: saveData) {
    const webx = showCang.fetch;
    for (const i of webx) {
        fetch(saveTemplate(i.url, obj), {
            method: i.method,
            body: saveTemplate(i.body, obj),
            headers: i.headers,
        });
    }
}

function getLansName(l: string[]) {
    const mainLan = store.get("语言.语言");
    const trans = new Intl.DisplayNames(mainLan, { type: "language" });
    const lansName = l.map((i) => ({
        text: i === "auto" ? "自动" : trans.of(i),
        lan: i,
    }));
    return lansName.toSorted((a, b) => a.text.localeCompare(b.text, mainLan));
}

function pick2First(list: { text: string; lan: string }[], toPick: string[]) {
    const baseList = list.filter((i) => !toPick.includes(i.lan));
    const first = toPick.map((i) => list.find((j) => j.lan === i));
    return first.concat(baseList);
}

const inputText = decodeURIComponent(
    new URLSearchParams(location.search).get("text") || "",
).trim();

const fyq = store.get("翻译.翻译器");
const fanyiqi = new Map(
    fyq.map((f) => {
        const e = xtranslator.es[f.type]();
        // @ts-ignore
        e.setKeys(f.keys);
        return [f.id, e];
    }),
);

const showCang = store.get("翻译.收藏");

const allFromLan = Array.from(
    new Set(fyq.flatMap((f) => xtranslator.e[f.type]?.lan)),
);
const allToLan = Array.from(
    new Set(fyq.flatMap((f) => xtranslator.e[f.type]?.targetLan)),
);

console.log("allFromLan", allFromLan);
console.log("allToLan", allToLan);

const c常用语言 = store.get("翻译.常用语言");

lansFrom.add(
    pick2First(getLansName(allFromLan), ["auto", ...c常用语言]).map((v) =>
        ele("option").add(txt(v.text)).attr({ value: v.lan }),
    ),
    10,
);
lansTo.add(
    pick2First(getLansName(allToLan), c常用语言).map((v) =>
        ele("option").add(txt(v.text)).attr({ value: v.lan }),
    ),
    10,
);

input.el.value = inputText;
if (inputText) {
    const fromLan = "auto"; // todo 检测
    const m = matchFitLan(fromLan, c常用语言);
    const toLan =
        c常用语言.filter((i) => i !== m).at(0) ?? store.get("语言.语言");
    lansFrom.el.value = fromLan;
    lansTo.el.value = toLan;
    translate(inputText);
} else {
    lansFrom.el.value = "auto";
    lansTo.el.value = store.get("语言.语言");
}

let composing = false;
input
    .on("compositionstart", () => {
        composing = true;
    })
    .on("compositionend", () => {
        composing = false;
    });

let lastTrans: NodeJS.Timeout;

input.on("input", () => {
    if (composing) return;
    if (lastTrans) clearTimeout(lastTrans);
    lastTrans = setTimeout(() => {
        translate(input.el.value);
    }, 2000);
});
