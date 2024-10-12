"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vidsrc_js_1 = __importDefault(require("./src/vidsrc.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Sample route to get movie data
app.get('/movie/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Here you would integrate your tmdbScrape or any other logic to fetch data
    const movieData = yield (0, vidsrc_js_1.default)(id, 'movie'); // Example of using your existing function
    res.json(movieData);
}));
// Sample route to get TV data
app.get('/tv/:id/:season/:episode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, season, episode } = req.params;
    // Similar integration as above
    const tvData = yield (0, vidsrc_js_1.default)(id, 'tv', Number(season), Number(episode));
    res.json(tvData);
}));
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
