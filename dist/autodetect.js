/**
 * Auto-detect variable values from the current environment.
 */
import { execSync } from 'node:child_process';
function git(cmd) {
    try {
        return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    }
    catch {
        return undefined;
    }
}
const DETECTORS = {
    branch: () => git('branch --show-current'),
    repo: () => {
        const remote = git('remote get-url origin');
        if (!remote)
            return undefined;
        const match = remote.match(/\/([^/]+?)(?:\.git)?$/);
        return match?.[1];
    },
    org: () => {
        const remote = git('remote get-url origin');
        if (!remote)
            return undefined;
        const match = remote.match(/[/:]([\w.-]+)\/[\w.-]+?(?:\.git)?$/);
        return match?.[1];
    },
    diff: () => git('diff --staged') || git('diff'),
    pr: () => {
        try {
            const out = execSync('gh pr view --json number --jq .number', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            return out || undefined;
        }
        catch {
            return undefined;
        }
    },
    user: () => git('config user.name'),
    date: () => new Date().toISOString().split('T')[0],
};
export function autodetect(varName) {
    const detector = DETECTORS[varName];
    return detector ? detector() : undefined;
}
export function autodetectAll(varNames) {
    const result = {};
    for (const name of varNames) {
        const value = autodetect(name);
        if (value !== undefined)
            result[name] = value;
    }
    return result;
}
//# sourceMappingURL=autodetect.js.map