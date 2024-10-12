import tmdbScrape from "./src/vidsrc.ts";

(async () => {
  console.log(await tmdbScrape("49521", "movie"));
  // console.log(await tmdbScrape("1399", "tv", 1, 1));
})();
