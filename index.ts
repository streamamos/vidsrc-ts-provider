import express from 'express';
import tmdbScrape from "./src/vidsrc.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route to get movie data
app.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  // Here you would integrate your tmdbScrape or any other logic to fetch data
  const movieData = await tmdbScrape(id, 'movie'); // Example of using your existing function
  res.json(movieData);
});

// Sample route to get TV data
app.get('/tv/:id/:season/:episode', async (req, res) => {
  const { id, season, episode } = req.params;
  // Similar integration as above
  const tvData = await tmdbScrape(id, 'tv', Number(season), Number(episode));
  res.json(tvData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
