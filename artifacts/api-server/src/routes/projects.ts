import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db/schema";
import { nexaSettingsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserFromToken } from "../lib/supabaseAdmin.js";

const router: IRouter = Router();

async function getSettingValue(key: string): Promise<string | null> {
  const rows = await db.select().from(nexaSettingsTable).where(eq(nexaSettingsTable.key, key));
  return rows[0]?.value ?? null;
}

function formatProject(p: typeof projectsTable.$inferSelect) {
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    description: p.description,
    prompt: p.prompt,
    techStack: p.techStack,
    files: (p.files as Array<{ path: string; content: string }>) ?? [],
    githubUrl: p.githubUrl ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/projects", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, user.id))
    .orderBy(desc(projectsTable.createdAt));

  res.json({ projects: projects.map(formatProject) });
});

router.post("/projects", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { prompt, techStack = "React" } = req.body as { prompt: string; techStack?: string; userId?: string };

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const geminiKey = await getSettingValue("GEMINI_API_KEY");
  if (!geminiKey) return res.status(400).json({ error: "Gemini API key not configured. Please ask an admin to add it." });

  let generated: { name: string; description: string; files: Array<{ path: string; content: string }> };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert developer. Generate a complete, working ${techStack} project based on this description:

"${prompt}"

Respond ONLY with valid JSON (no markdown, no code blocks) in this exact format:
{
  "name": "project-name-slug",
  "description": "One sentence description",
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "full file content here"
    }
  ]
}

Generate 3-6 meaningful files that make the project functional. Include a README.md. Use ${techStack} as the primary tech stack.`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const geminiData = await geminiRes.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    const rawText = geminiData.candidates[0]?.content?.parts[0]?.text ?? "{}";

    const cleanText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    generated = JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini generation error:", e);
    return res.status(500).json({ error: `AI generation failed: ${(e as Error).message}` });
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      userId: user.id,
      name: generated.name || "untitled-project",
      description: generated.description || prompt.slice(0, 120),
      prompt,
      techStack,
      files: generated.files || [],
    })
    .returning();

  res.status(201).json(formatProject(project));
});

router.get("/projects/:id", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));

  if (!project || project.userId !== user.id) {
    return res.status(404).json({ error: "Project not found" });
  }

  res.json(formatProject(project));
});

router.delete("/projects/:id", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
  if (!project || project.userId !== user.id) {
    return res.status(404).json({ error: "Project not found" });
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, req.params.id));
  res.json({ success: true, message: "Project deleted" });
});

router.post("/projects/:id/push-github", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, req.params.id));
  if (!project || project.userId !== user.id) {
    return res.status(404).json({ error: "Project not found" });
  }

  const githubToken = await getSettingValue("GITHUB_TOKEN");
  if (!githubToken) {
    return res.status(400).json({ error: "GitHub token not configured. Please ask an admin to add it." });
  }

  const { repoName, isPrivate = false } = req.body as { repoName: string; isPrivate?: boolean };
  if (!repoName) return res.status(400).json({ error: "Repository name is required" });

  try {
    // Get authenticated user info from GitHub
    const meRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${githubToken}`, "User-Agent": "Anexai-SaaS" },
    });
    if (!meRes.ok) throw new Error("Invalid GitHub token");
    const me = await meRes.json() as { login: string };

    // Create repo
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Anexai-SaaS",
      },
      body: JSON.stringify({
        name: repoName,
        description: project.description,
        private: isPrivate,
        auto_init: false,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json() as { message: string };
      throw new Error(err.message || "Failed to create repository");
    }

    const repo = await createRes.json() as { html_url: string; full_name: string };

    // Push files
    const files = (project.files as Array<{ path: string; content: string }>) ?? [];
    for (const file of files) {
      const contentB64 = Buffer.from(file.content).toString("base64");
      await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Anexai-SaaS",
        },
        body: JSON.stringify({
          message: `Add ${file.path}`,
          content: contentB64,
        }),
      });
    }

    await db
      .update(projectsTable)
      .set({ githubUrl: repo.html_url, updatedAt: new Date() })
      .where(eq(projectsTable.id, project.id));

    res.json({ success: true, repoUrl: repo.html_url, message: `Repository created at ${repo.html_url}` });
  } catch (e) {
    console.error("GitHub push error:", e);
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
