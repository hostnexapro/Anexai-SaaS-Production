import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, relative } from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "hostnexapro/Anexai-SaaS-Production";
const WORKSPACE = "/home/runner/workspace";

// Priority files — most important ones first
const PRIORITY_FILES = [
  "replit.md",
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "tsconfig.base.json",
  "lib/api-spec/openapi.yaml",
  "lib/db/src/schema/projects.ts",
  "lib/db/src/schema/index.ts",
  "lib/db/src/index.ts",
  "lib/db/package.json",
  "lib/db/drizzle.config.ts",
  "artifacts/api-server/src/index.ts",
  "artifacts/api-server/src/app.ts",
  "artifacts/api-server/src/lib/supabaseAdmin.ts",
  "artifacts/api-server/src/routes/index.ts",
  "artifacts/api-server/src/routes/health.ts",
  "artifacts/api-server/src/routes/settings.ts",
  "artifacts/api-server/src/routes/projects.ts",
  "artifacts/api-server/package.json",
  "artifacts/api-server/tsconfig.json",
  "artifacts/anexai/src/lib/supabase.ts",
  "artifacts/anexai/src/lib/auth-context.tsx",
  "artifacts/anexai/src/lib/utils.ts",
  "artifacts/anexai/src/App.tsx",
  "artifacts/anexai/src/main.tsx",
  "artifacts/anexai/src/index.css",
  "artifacts/anexai/src/pages/Login.tsx",
  "artifacts/anexai/src/pages/Dashboard.tsx",
  "artifacts/anexai/src/pages/Projects.tsx",
  "artifacts/anexai/src/pages/NewProject.tsx",
  "artifacts/anexai/src/pages/ProjectDetail.tsx",
  "artifacts/anexai/src/pages/Admin.tsx",
  "artifacts/anexai/src/pages/not-found.tsx",
  "artifacts/anexai/src/components/layout/AppLayout.tsx",
  "artifacts/anexai/src/components/ui/PremiumButton.tsx",
  "artifacts/anexai/index.html",
  "artifacts/anexai/vite.config.ts",
  "artifacts/anexai/package.json",
  "artifacts/anexai/tsconfig.json",
  "scripts/src/setup-db.ts",
  "scripts/src/push-to-github.ts",
  "scripts/package.json",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function githubApiContents(path: string, content: string, message: string): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Anexai-SaaS",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ message, content }),
    });

    if (res.status === 201 || res.status === 200) return true;

    if (res.status === 422) {
      // File already exists with same content - that's fine
      return true;
    }

    if (res.status === 403 || res.status === 429) {
      console.log(`    Rate limited (attempt ${attempt + 1}), waiting 15s...`);
      await sleep(15000);
      continue;
    }

    const err = await res.text();
    console.warn(`    HTTP ${res.status}: ${err.slice(0, 100)}`);
    return false;
  }
  return false;
}

async function main() {
  console.log(`Pushing ${PRIORITY_FILES.length} core files to https://github.com/${REPO}\n`);

  let pushed = 0;
  let failed = 0;

  for (let i = 0; i < PRIORITY_FILES.length; i++) {
    const relPath = PRIORITY_FILES[i];
    const absPath = join(WORKSPACE, relPath);

    if (!existsSync(absPath)) {
      console.log(`  [${i + 1}/${PRIORITY_FILES.length}] SKIP (not found): ${relPath}`);
      continue;
    }

    const content = readFileSync(absPath, "base64");
    const message = i === 0
      ? "feat: Initial commit - Anexai AI SaaS Platform"
      : `feat: Add ${relPath}`;

    process.stdout.write(`  [${i + 1}/${PRIORITY_FILES.length}] ${relPath} ... `);
    const ok = await githubApiContents(relPath, content, message);

    if (ok) {
      pushed++;
      console.log("✓");
    } else {
      failed++;
      console.log("✗");
    }

    // Small delay between files to avoid secondary rate limits
    await sleep(300);
  }

  console.log(`\n${"─".repeat(50)}`);
  if (pushed > 0) {
    console.log(`✅ PUSH COMPLETE!`);
    console.log(`   Repository: https://github.com/${REPO}`);
    console.log(`   Files pushed: ${pushed}  |  Failed: ${failed}`);
  } else {
    console.log(`❌ All files failed to push`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("\n❌ FATAL:", e.message);
  process.exit(1);
});
