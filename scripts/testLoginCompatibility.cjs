const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");
const file = path.resolve(__dirname, "../services/authApi/auth.ts");
const { outputText, diagnostics } = ts.transpileModule(fs.readFileSync(file, "utf8"), { fileName: file, reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
assert.equal(diagnostics.length, 0);
let calls = [], replies = [], os = "android";
const axiosInstance = { post: async (url, body) => { calls.push({ url, body }); const next = replies.shift(); if (next) throw next; return { data: { token: "test-token" } }; } };
const mocks = {
  "./axiosInstance": { axiosInstance }, "../../hooks/useAsyncStorage": { getData: async () => null },
  "expo-device": { manufacturer: "Samsung", modelName: "SM-A042F", osVersion: "14" },
  "react-native": { Platform: { get OS() { return os; } }, Alert: { alert() {} } },
};
const mod = { exports: {} };
vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`)(name => mocks[name], mod, mod.exports);
const rejected = (message, status = 400) => ({ response: { status, data: message } });
const credentials = { email: "test@example.invalid", password: "test-only", deviceId: "test-device" };
const reset = (...errors) => { calls = []; replies = errors; };
(async () => {
  reset(); assert.deepEqual(await mod.exports.login(credentials), { token: "test-token" }); assert.equal(calls.length, 1);
  assert.equal(calls[0].body.platform, "Android"); assert.equal(calls[0].body.deviceName, "Samsung SM-A042F 14");
  reset(rejected('"platform" is not allowed'), rejected('"deviceName" is not allowed'));
  await mod.exports.login(credentials); assert.equal(calls.length, 3);
  assert.equal(calls[0].body.platform, "Android"); assert.equal(calls[1].body.platform, undefined); assert.equal(calls[1].body.deviceName, "Samsung SM-A042F 14");
  assert.deepEqual(calls[2].body, credentials); assert.ok(calls.every(call => call.url === "/api/auth/login"));
  reset(rejected({ message: '"deviceName" is not allowed' })); await mod.exports.login(credentials);
  assert.equal(calls[1].body.platform, "Android"); assert.equal(calls[1].body.deviceName, undefined);
  for (const error of [rejected("Wrong credentials", 401), rejected("Mobile session already active", 409), rejected("Account disabled", 403), rejected('"email" is not allowed'), rejected('"platform" must be one of [Web, Android, iOS]'), rejected('"platform" is not allowed', 500), new Error("Network timeout")]) {
    reset(error); await assert.rejects(mod.exports.login(credentials), actual => actual === error); assert.equal(calls.length, 1);
  }
  reset(rejected('"platform" is not allowed'), rejected('"platform" is not allowed'));
  await assert.rejects(mod.exports.login(credentials)); assert.equal(calls.length, 2, "Repeated unknown-field error must stop");
  for (const [platform, expected] of [["ios", "iOS"], ["web", "Web"]]) { os = platform; reset(); await mod.exports.login(credentials); assert.equal(calls[0].body.platform, expected); }
  assert.deepEqual(credentials, { email: "test@example.invalid", password: "test-only", deviceId: "test-device" });
  console.log("Login compatibility: metadata, bounded legacy-validator retries, platform mapping, unchanged credentials/device ID and no retry of authentication/session/security failures passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
