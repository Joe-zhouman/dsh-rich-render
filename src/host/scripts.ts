/**
 * Python programs the host writes into the plugin's .cache dir and executes
 * as script files. No `-c` strings (quoting hazards through the sandboxed
 * pwsh command line) and no stdin carriage (the pwsh-sandbox executor drops
 * the stdin field); a file the confined python only reads is the one channel
 * every executor carries.
 */

/** One-shot availability probe: versions without importing the heavy libs. */
export const DETECT_PROGRAM = [
  'import json, sys, importlib.util, importlib.metadata',
  'result = {"python": sys.version.split()[0]}',
  'for name in ("matplotlib", "numpy"):',
  '    try:',
  '        result[name] = str(importlib.metadata.version(name)) if importlib.util.find_spec(name) is not None else None',
  '    except Exception:',
  '        result[name] = None',
  'print(json.dumps(result))',
  '',
].join('\n')

/**
 * One cell executor: the request JSON (code only) is spliced into the
 * program, which the host writes to a content-addressed script file. User
 * prints are captured and discarded; the current figure is saved to an
 * in-memory buffer and returned base64-encoded. Seeds are pinned and the
 * cell sees `plt`/`np` in scope (the persona's examples assume them).
 * @param code - Python source from the fence.
 * @returns the complete program for the script file.
 */
export function buildRunnerProgram(code: string): string {
  return [
    'import base64, io, json, random, sys, traceback',
    '',
    'import matplotlib',
    'matplotlib.use("Agg")',
    'import matplotlib.pyplot as plt',
    'import numpy as np',
    '',
    `request = json.loads(${JSON.stringify(JSON.stringify({ code }))})`,
    'random.seed(0)',
    'np.random.seed(0)',
    'result = {"status": "success"}',
    'try:',
    '    code = compile(request["code"], "<cell>", "exec")',
    '    scope = {"__name__": "__main__", "plt": plt, "np": np}',
    '    sys.stdout = io.StringIO()',
    '    try:',
    '        exec(code, scope)',
    '    finally:',
    '        sys.stdout = sys.__stdout__',
    '    png = io.BytesIO()',
    '    plt.gcf().savefig(png, format="png", dpi=100)',
    '    result["image"] = base64.b64encode(png.getvalue()).decode("ascii")',
    'except Exception:',
    '    result = {"status": "error", "message": traceback.format_exc(limit=8)}',
    'sys.stdout.write(json.dumps(result))',
    '',
  ].join('\n')
}
