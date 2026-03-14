import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { nexaSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromToken, getUserRole } from "../lib/supabaseAdmin.js";

const router: IRouter = Router();

async function getSettingValue(key: string): Promise<string | null> {
  const rows = await db.select().from(nexaSettingsTable).where(eq(nexaSettingsTable.key, key));
  return rows[0]?.value ?? null;
}

async function upsertSetting(key: string, value: string) {
  const existing = await db.select().from(nexaSettingsTable).where(eq(nexaSettingsTable.key, key));
  if (existing.length > 0) {
    await db.update(nexaSettingsTable).set({ value, updatedAt: new Date() }).where(eq(nexaSettingsTable.key, key));
  } else {
    await db.insert(nexaSettingsTable).values({ key, value });
  }
}

router.get("/settings", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const role = await getUserRole(user.id);
  if (role !== "admin") return res.status(403).json({ error: "Admin access required" });

  const geminiApiKey = await getSettingValue("GEMINI_API_KEY");
  const githubToken = await getSettingValue("GITHUB_TOKEN");

  res.json({
    geminiApiKey: geminiApiKey ? "***" + geminiApiKey.slice(-4) : null,
    githubToken: githubToken ? "***" + githubToken.slice(-4) : null,
  });
});

router.post("/settings", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const role = await getUserRole(user.id);
  if (role !== "admin") return res.status(403).json({ error: "Admin access required" });

  const { geminiApiKey, githubToken } = req.body as { geminiApiKey?: string; githubToken?: string };

  if (geminiApiKey && !geminiApiKey.startsWith("***")) {
    await upsertSetting("GEMINI_API_KEY", geminiApiKey);
  }
  if (githubToken && !githubToken.startsWith("***")) {
    await upsertSetting("GITHUB_TOKEN", githubToken);
  }

  const newGemini = await getSettingValue("GEMINI_API_KEY");
  const newGithub = await getSettingValue("GITHUB_TOKEN");

  res.json({
    geminiApiKey: newGemini ? "***" + newGemini.slice(-4) : null,
    githubToken: newGithub ? "***" + newGithub.slice(-4) : null,
  });
});

export default router;
