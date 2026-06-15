import { Router } from "express";
import { CATEGORIES, LEAGUE_MAP } from "../config.js";

const router = Router();

router.get("/categories", (_req, res) => {
  const categories = CATEGORIES.map((id) => ({
    id,
    kind: id === "f1" ? "session" : "game",
    leagueId: LEAGUE_MAP[id] ?? null,
  }));
  res.json({ categories });
});

export default router;
