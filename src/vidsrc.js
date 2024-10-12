"use strict";
/*
written by @cool-dev-guy
github: https://github.com/cool-dev-guy
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
NOTES: The current code is compatible to use as a module in nodejs projects.
import * as cheerio from "cheerio"; // FOR NODE.JS
import * as cheerio from "npm:cheerio"; // FOR DENO
*/
const cheerio = require("cheerio");
const decoder_1 = require("./helpers/decoder");
let BASEDOM = "https://whisperingauroras.com";
function serversLoad(html) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const $ = cheerio.load(html);
        const servers = [];
        const title = (_a = $("title").text()) !== null && _a !== void 0 ? _a : "";
        const base = (_b = $("iframe").attr("src")) !== null && _b !== void 0 ? _b : "";
        BASEDOM = (_c = new URL(base.startsWith("//") ? "https:" + base : base).origin) !== null && _c !== void 0 ? _c : BASEDOM;
        $(".serversList .server").each((index, element) => {
            var _a;
            const server = $(element);
            servers.push({
                name: server.text().trim(),
                dataHash: (_a = server.attr("data-hash")) !== null && _a !== void 0 ? _a : null,
            });
        });
        return {
            servers: servers,
            title: title,
        };
    });
}
function SRCRCPhandler() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function PRORCPhandler(prorcp) {
    return __awaiter(this, void 0, void 0, function* () {
        const prorcpFetch = yield fetch(`${BASEDOM}/prorcp/${prorcp}`);
        const prorcpResponse = yield prorcpFetch.text();
        const scripts = prorcpResponse.match(/<script\s+src="\/([^"]*\.js)\?\_=([^"]*)"><\/script>/gm);
        const script = (scripts === null || scripts === void 0 ? void 0 : scripts[scripts.length - 1].includes("cpt.js"))
            ? scripts === null || scripts === void 0 ? void 0 : scripts[scripts.length - 2].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2")
            : scripts === null || scripts === void 0 ? void 0 : scripts[scripts.length - 1].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2");
        const jsFileReq = yield fetch(`${BASEDOM}/${script}`, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "priority": "u=1",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "script",
                "sec-fetch-mode": "no-cors",
                "sec-fetch-site": "same-origin",
                "Referer": `${BASEDOM}/`,
                "Referrer-Policy": "origin",
            },
            "body": null,
            "method": "GET",
        });
        const jsCode = yield jsFileReq.text();
        const decryptRegex = /{}\}window\[([^"]+)\("([^"]+)"\)/;
        const decryptMatches = jsCode.match(decryptRegex);
        // ^ this func is the decrypt function (fn name)
        const $ = cheerio.load(prorcpResponse);
        if (!decryptMatches || (decryptMatches === null || decryptMatches === void 0 ? void 0 : decryptMatches.length) < 3)
            return null;
        const id = (0, decoder_1.decrypt)(decryptMatches[2].toString().trim(), decryptMatches[1].toString().trim());
        const data = $("#" + id);
        const result = yield (0, decoder_1.decrypt)(yield data.text(), decryptMatches[2].toString().trim());
        return result;
    });
}
function rcpGrabber(html) {
    return __awaiter(this, void 0, void 0, function* () {
        const regex = /src:\s*'([^']*)'/;
        const match = html.match(regex);
        if (!match)
            return null;
        return {
            metadata: {
                image: "",
            },
            data: match[1],
        };
    });
}
function tmdbScrape(tmdbId, type, season, episode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (season && episode && (type === "movie")) {
            throw new Error("Invalid Data.");
        }
        const url = (type === "movie")
            ? `https://vidsrc.net/embed/${type}?tmdb=${tmdbId}`
            : `https://vidsrc.net/embed/${type}?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
        const embed = yield fetch(url);
        const embedResp = yield embed.text();
        // get some metadata
        const { servers, title } = yield serversLoad(embedResp);
        const rcpFetchPromises = servers.map(element => {
            return fetch(`${BASEDOM}/rcp/${element.dataHash}`);
        });
        const rcpResponses = yield Promise.all(rcpFetchPromises);
        const prosrcrcp = yield Promise.all(rcpResponses.map((response) => __awaiter(this, void 0, void 0, function* () {
            return rcpGrabber(yield response.text());
        })));
        const apiResponse = [];
        for (const item of prosrcrcp) {
            if (!item)
                continue;
            switch (item.data.substring(0, 8)) {
                case "/prorcp/":
                    apiResponse.push({
                        name: title,
                        image: item.metadata.image,
                        mediaId: tmdbId,
                        stream: yield PRORCPhandler(item.data.replace("/prorcp/", "")),
                        referer: BASEDOM,
                    });
                    break;
            }
        }
        return apiResponse;
    });
}
exports.default = tmdbScrape;
