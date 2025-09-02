#!/usr/bin/env bun

/**
 * Script to generate manifest.json from assets directory
 */

import { readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";

async function scanDirectory(dir) {
	try {
		const items = await readdir(dir);
		return items.filter((item) => !item.startsWith("."));
	} catch {
		return [];
	}
}

async function getFileInfo(path, name, description = "") {
	const stats = await stat(path);
	return {
		name: name.replace(/\.(md|ts|js|json)$/, ""),
		filename: basename(path),
		size: stats.size,
		description: description || name.replace(/[-_]/g, " "),
	};
}

async function getReferenceProject(projectDir) {
	const name = basename(projectDir);
	const files = await scanDirectory(projectDir);

	return {
		name,
		files,
		description: name.replace(/[-_]/g, " "),
	};
}

async function generateManifest() {
	console.log("📋 Generating manifest.json...");

	const manifest = {
		version: "1.0.0",
		generated: new Date().toISOString(),
		agents: [],
		docs: [],
		reference: [],
	};

	// Scan agents
	const agentsDir = join(process.cwd(), "assets/agents");
	const agents = await scanDirectory(agentsDir);
	for (const agent of agents) {
		const path = join(agentsDir, agent);
		const info = await getFileInfo(path, agent, getAgentDescription(agent));
		manifest.agents.push(info);
	}

	// Scan docs
	const docsDir = join(process.cwd(), "assets/docs");
	const docs = await scanDirectory(docsDir);
	for (const doc of docs) {
		const path = join(docsDir, doc);
		const info = await getFileInfo(path, doc);
		info.category = categorizeDoc(doc);
		manifest.docs.push(info);
	}

	// Scan reference code
	const refDir = join(process.cwd(), "assets/reference_code");
	const refs = await scanDirectory(refDir);
	for (const ref of refs) {
		const path = join(refDir, ref);
		const stats = await stat(path);
		if (stats.isDirectory()) {
			const project = await getReferenceProject(path);
			manifest.reference.push(project);
		}
	}

	// Write manifest
	await Bun.write("manifest.json", JSON.stringify(manifest, null, 2));

	console.log(`✅ Generated manifest with:`);
	console.log(`   ${manifest.agents.length} agents`);
	console.log(`   ${manifest.docs.length} documentation files`);
	console.log(`   ${manifest.reference.length} reference projects`);
}

function getAgentDescription(filename) {
	const descriptions = {
		"docs-researcher.md": "Research documentation for JS/TS libraries",
		"react-developer.md": "Expert React and Next.js development",
		"system-architect.md": "Design and architect applications",
		"task-breakdown.md": "Break down complex tasks into subtasks",
		"task-documenter.md": "Create comprehensive documentation",
		"task-planner.md": "Plan complex TypeScript development tasks",
		"test-task-planner.md": "Create comprehensive test plans",
		"typescript-code-reviewer.md": "Review TypeScript code quality",
		"typescript-developer.md": "Implement complex TypeScript features",
		"typescript-reference-developer.md": "Generate reference implementations",
		"typescript-test-developer.md": "Generate and maintain tests",
	};
	return (
		descriptions[filename] || filename.replace(/[-_]/g, " ").replace(".md", "")
	);
}

function categorizeDoc(filename) {
	if (filename.includes("claude-code")) return "Claude Code";
	if (filename.includes("bun")) return "Bun";
	if (filename.includes("react") || filename.includes("next"))
		return "React/Next.js";
	if (filename.includes("typescript") || filename.includes("ts"))
		return "TypeScript";
	if (filename.includes("test")) return "Testing";
	if (filename.includes("hono") || filename.includes("api")) return "API";
	if (
		filename.includes("ui") ||
		filename.includes("tailwind") ||
		filename.includes("shadcn")
	)
		return "UI/Styling";
	if (
		filename.includes("orm") ||
		filename.includes("drizzle") ||
		filename.includes("database")
	)
		return "Database";
	return "General";
}

// Run the script
generateManifest().catch(console.error);
