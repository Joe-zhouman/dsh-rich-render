import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import z from "@deepseek-ai/schemastery";
import { createHash } from "node:crypto";
//#region src/host/persona.ts
/**
* Split and substitute persona.md.
* @param markdown - persona.md contents.
* @param versions - detected versions; undefined suppresses the matplotlib section.
*/
function buildSections(markdown, versions) {
	const parts = markdown.split(/^---\s*$/mu);
	const environments = (parts[1] ?? "").trim();
	const template = (parts[2] ?? "").trim();
	return {
		environments,
		matplotlib: versions === void 0 || template === "" ? void 0 : template.replaceAll("{python}", versions.python).replaceAll("{matplotlib}", versions.matplotlib).replaceAll("{numpy}", versions.numpy)
	};
}
/**
* Whether one assembly should see rich-render sections.
* @param origin - `assembleContext.agent?.session?.header?.origin`.
* @returns true unless the assembly belongs to a subagent.
*/
function isMainSession(origin) {
	return origin !== "subagent";
}
//#endregion
//#region src/host/scripts.ts
/**
* Python programs the host writes into the plugin's .cache dir and executes
* as script files. No `-c` strings (quoting hazards through the sandboxed
* pwsh command line) and no stdin carriage (the pwsh-sandbox executor drops
* the stdin field); a file the confined python only reads is the one channel
* every executor carries.
*/
/** One-shot availability probe: versions without importing the heavy libs. */
const DETECT_PROGRAM = [
	"import json, sys, importlib.util, importlib.metadata",
	"result = {\"python\": sys.version.split()[0]}",
	"for name in (\"matplotlib\", \"numpy\"):",
	"    try:",
	"        result[name] = str(importlib.metadata.version(name)) if importlib.util.find_spec(name) is not None else None",
	"    except Exception:",
	"        result[name] = None",
	"print(json.dumps(result))",
	""
].join("\n");
/**
* One cell executor: the request JSON (code only) is spliced into the
* program, which the host writes to a content-addressed script file. User
* prints are captured and discarded; the current figure is saved to an
* in-memory buffer and returned base64-encoded. Seeds are pinned and the
* cell sees `plt`/`np` in scope (the persona's examples assume them).
* @param code - Python source from the fence.
* @returns the complete program for the script file.
*/
function buildRunnerProgram(code) {
	return [
		"import base64, io, json, random, sys, traceback",
		"",
		"import matplotlib",
		"matplotlib.use(\"Agg\")",
		"import matplotlib.pyplot as plt",
		"import numpy as np",
		"",
		`request = json.loads(${JSON.stringify(JSON.stringify({ code }))})`,
		"random.seed(0)",
		"np.random.seed(0)",
		"result = {\"status\": \"success\"}",
		"try:",
		"    code = compile(request[\"code\"], \"<cell>\", \"exec\")",
		"    scope = {\"__name__\": \"__main__\", \"plt\": plt, \"np\": np}",
		"    sys.stdout = io.StringIO()",
		"    try:",
		"        exec(code, scope)",
		"    finally:",
		"        sys.stdout = sys.__stdout__",
		"    png = io.BytesIO()",
		"    plt.gcf().savefig(png, format=\"png\", dpi=100)",
		"    result[\"image\"] = base64.b64encode(png.getvalue()).decode(\"ascii\")",
		"except Exception:",
		"    result = {\"status\": \"error\", \"message\": traceback.format_exc(limit=8)}",
		"sys.stdout.write(json.dumps(result))",
		""
	].join("\n");
}
//#endregion
//#region src/host/detect.ts
/**
* Parse the probe output (the run's exit code is the caller's gate).
* @param output - stdout of the detect run.
* @returns versions when python ran, exited 0, and both libs report versions; undefined otherwise.
*/
function detectFromOutput(output) {
	let parsed;
	try {
		parsed = JSON.parse(output.trim().split("\n").at(-1) ?? "");
	} catch {
		return;
	}
	if (typeof parsed !== "object" || parsed === null) return void 0;
	const record = parsed;
	const pick = (key) => typeof record[key] === "string" && record[key] !== "" ? record[key] : void 0;
	const python = pick("python");
	const matplotlib = pick("matplotlib");
	const numpy = pick("numpy");
	if (python === void 0 || matplotlib === void 0 || numpy === void 0) return void 0;
	return {
		python,
		matplotlib,
		numpy
	};
}
//#endregion
//#region src/host/matplotlib.ts
/**
* Cell execution with a content-addressed in-process cache. The key covers
* code + backend + versions + DPI + font name; failures cache exactly like
* successes — no retry path. Persistence beyond the host process is
* deliberately absent: the deployment's sandboxed fs fences every
* plugin-chosen cache location, and a restart re-running a cell once is
* cheaper than a writable-root escape hatch.
*
* The program travels as a script FILE under the plugin's own `.cache/` dir,
* not shell stdin: this deployment's sandboxed shell executor (pwsh-sandbox)
* drops the stdin field. The host process writes the file unrestricted; the
* confined python only needs to read it (the sandbox restricts writes, not
* reads), and the script dir sits inside the sandbox's workspace root anyway.
*/
/** Fixed execution parameters; every one participates in the cache key. */
const DPI = 100;
const BACKEND = "Agg";
const FONT = "default";
/** Theme dimension of the cache key: theming is deferred, so one constant value. */
const THEME = "default";
const TIMEOUT_MS = 6e4;
const STDOUT_MAX = 8 * 1024 * 1024;
/**
* Parse one runner stdout.
* @param output - runner stdout.
* @param run - exit classification of the same run.
* @returns the settled result (a crashed runner is an error result, never undefined).
*/
function runResultFromOutput(output, run) {
	let parsed;
	try {
		parsed = JSON.parse(output.trim().split("\n").at(-1) ?? "");
	} catch {
		parsed = void 0;
	}
	if (typeof parsed === "object" && parsed !== null) {
		const record = parsed;
		if (record.status === "success" && typeof record.image === "string" && record.image !== "") return {
			status: "success",
			image: record.image
		};
		if (record.status === "error" && typeof record.message === "string" && record.message !== "") return {
			status: "error",
			message: record.message
		};
	}
	return {
		status: "error",
		message: (run.stderr.trim() !== "" ? run.stderr.trim() : `python exited with code ${String(run.exitCode)}`).slice(-2e3)
	};
}
/** Executes cells; owns the in-memory cache and the script files. */
var MatplotlibRunner = class {
	memory = /* @__PURE__ */ new Map();
	deps;
	constructor(deps) {
		this.deps = deps;
	}
	key(code) {
		const { versions } = this.deps;
		return createHash("sha256").update([
			code,
			BACKEND,
			THEME,
			versions.python,
			versions.matplotlib,
			versions.numpy,
			String(DPI),
			FONT
		].join("\0")).digest("hex");
	}
	/**
	* Run one cell (cache-first). The program file is content-addressed by the
	* same key as the result cache, so an existing file is reused as-is.
	* @param code - Python source from the fence.
	* @returns the settled outcome; never throws.
	*/
	async run(code) {
		const key = this.key(code);
		const cached = this.memory.get(key);
		if (cached !== void 0) return cached;
		let result;
		try {
			const script = join(this.deps.scriptDir, `mpl-${key}.py`);
			if (!existsSync(script)) writeFileSync(script, buildRunnerProgram(code));
			const spec = this.deps.shell.resolve({
				command: `${this.deps.python} "${script.replaceAll("\\", "/")}"`,
				timeoutMs: TIMEOUT_MS,
				env: { MPLBACKEND: BACKEND },
				stdoutMaxBytes: STDOUT_MAX,
				sandboxPolicy: {
					mode: "read-only",
					workspaceRoot: this.deps.scriptDir.replaceAll("\\", "/")
				}
			});
			const run = await (await this.deps.shell.execute(spec)).result();
			result = runResultFromOutput(run.stdout.text, {
				exitCode: run.exitCode,
				stderr: run.stderr.text
			});
		} catch (error) {
			result = {
				status: "error",
				message: String(error).slice(0, 2e3)
			};
		}
		this.memory.set(key, result);
		return result;
	}
};
//#endregion
//#region index.mjs
/**
* Host half of dsh-rich-render: persona injection (merged environments
* section always; a matplotlib section whenever enabled — its text stays
* empty until the startup probe fills the detected versions) plus the
* /rich-render RPC channel the browser half calls for matplotlib
* status/execution. Rendering stays in src/client.ts.
*
* Sections filter subagents per assembly (header.origin); interpolate stays
* off because persona text is prose that may legitimately contain braces.
* Detection runs once at load — environment changes need a restart, matching
* the MCP startup-check semantics. The matplotlib section registers
* synchronously (an empty section assembles to nothing), so no registration
* races the plugin fiber's disposal.
*/
const name = "dsh-rich-render";
const inject = [
	"systemPrompt",
	"shell",
	"connection"
];
const Config = z.object({ matplotlib: z.object({
	enabled: z.boolean().default(false),
	python: z.string().default("python")
}).default({
	enabled: false,
	python: "python"
}) });
const SECTION_ORDER = 9e3;
/**
* The python programs only read a script and print one JSON line, so they run
* read-only-confined: no writable path at all. That is stricter than the
* deployment's workspace-write default and, on this host, the only mode whose
* ACL runner starts (workspace-write must re-ACL the workspace root, which is
* not user-owned and refuses SetNamedSecurityInfoW).
* @param scriptDir - the plugin's .cache dir; nominal root for the policy.
*/
function readOnlyPolicy(scriptDir) {
	return {
		mode: "read-only",
		workspaceRoot: scriptDir.replaceAll("\\", "/")
	};
}
/**
* @param ctx - plugin context (systemPrompt, shell, connection injected).
* @param config - validated Config.
*/
function apply(ctx, config = {}) {
	const matplotlibConfig = config.matplotlib ?? {};
	const python = matplotlibConfig.python ?? "python";
	const enabled = matplotlibConfig.enabled ?? false;
	const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
	const scriptDir = join(packageRoot, ".cache");
	let markdown = "";
	try {
		mkdirSync(scriptDir, { recursive: true });
		markdown = readFileSync(join(packageRoot, "persona.md"), "utf8");
	} catch (error) {
		ctx.logger.warn(`rich-render: persona.md unreadable; prompt sections stay off (${String(error)})`);
	}
	const base = buildSections(markdown, void 0);
	let matplotlibText = "";
	let runner = void 0;
	const register = (name, order, textFn) => ctx.systemPrompt.section({
		name,
		order,
		interpolate: false,
		text: textFn
	});
	if (markdown !== "") {
		register("rich-render:environments", SECTION_ORDER, (assembleContext) => isMainSession(assembleContext?.agent?.session?.header?.origin) ? base.environments : "");
		if (enabled) register("rich-render:matplotlib", 9001, (assembleContext) => isMainSession(assembleContext?.agent?.session?.header?.origin) ? matplotlibText : "");
	}
	const rpcRoute = (path, endpoint, logic) => ({
		path,
		methods: ["POST"],
		requestBody: "buffered",
		fetch: async (request) => {
			const failure = (code, message) => ({
				ok: false,
				error: {
					code,
					message,
					details: {}
				}
			});
			let message;
			try {
				message = await request.json();
			} catch {
				message = void 0;
			}
			const rpcId = typeof message?.rpcId === "string" && message.rpcId !== "" ? message.rpcId : "invalid-request";
			const reply = (result) => Response.json({
				type: "server-response",
				rpcId,
				result
			});
			if (message?.type !== "client-request" || message.method !== endpoint) return reply(failure("bad-request", `rich-render: expected a ${endpoint} client-request`));
			try {
				return reply(await logic(message.payload));
			} catch (error) {
				return reply(failure("internal", String(error).slice(0, 500)));
			}
		}
	});
	ctx.effect(() => ctx.connection.fetch.register(rpcRoute("/api/rich-render/status", "rich-render/status", async () => ({
		ok: true,
		value: { matplotlib: {
			enabled,
			ready: runner !== void 0
		} }
	}))), "rich-render: status route");
	ctx.effect(() => ctx.connection.fetch.register(rpcRoute("/api/rich-render/exec", "rich-render/exec", async (payload) => {
		if (typeof payload?.code === "string" && runner !== void 0) return {
			ok: true,
			value: await runner.run(payload.code)
		};
		return {
			ok: false,
			error: {
				code: "unavailable",
				message: "rich-render: matplotlib exec is not available",
				details: {}
			}
		};
	})), "rich-render: exec route");
	if (!enabled || markdown === "") return;
	(async () => {
		try {
			const detectScript = join(scriptDir, "detect.py");
			writeFileSync(detectScript, DETECT_PROGRAM);
			const spec = ctx.shell.resolve({
				command: `${python} "${detectScript.replaceAll("\\", "/")}"`,
				timeoutMs: 3e4,
				sandboxPolicy: readOnlyPolicy(scriptDir)
			});
			const run = await (await ctx.shell.execute(spec)).result();
			if (run.exitCode !== 0) throw new Error(`detect exited ${String(run.exitCode)}: ${run.stderr.text.slice(0, 200)}`);
			const versions = detectFromOutput(run.stdout.text);
			if (versions === void 0) throw new Error("detect output missing matplotlib/numpy versions");
			runner = new MatplotlibRunner({
				shell: ctx.shell,
				python,
				versions,
				scriptDir
			});
			matplotlibText = buildSections(markdown, versions).matplotlib ?? "";
			ctx.logger.info(`rich-render: matplotlib ready (python ${versions.python}, matplotlib ${versions.matplotlib}, numpy ${versions.numpy})`);
		} catch (error) {
			ctx.logger.warn(`rich-render: matplotlib disabled (${String(error)})`);
		}
	})();
}
//#endregion
export { Config, apply, inject, name };
