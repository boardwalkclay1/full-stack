// frontend/app.js
const API_BASE = "http://localhost:8000";

const projectNameEl = document.getElementById("project-name");
const projectGoalEl = document.getElementById("project-goal");
const stackSelectEl = document.getElementById("stack-select");

const capScaffoldEl = document.getElementById("cap-scaffold");
const capDbEl = document.getElementById("cap-db");
const capApiEl = document.getElementById("cap-api");
const capAuthEl = document.getElementById("cap-auth");
const capMediaEl = document.getElementById("cap-media");
const capCloudflareEl = document.getElementById("cap-cloudflare");
const capFrontendEl = document.getElementById("cap-frontend");
const capServiceWorkerEl = document.getElementById("cap-serviceworker");
const capDeployEl = document.getElementById("cap-deploy");
const capFixEl = document.getElementById("cap-fix");

const runAgentBtn = document.getElementById("run-agent");
const runLimitedBtn = document.getElementById("run-limited");
const fixErrorsBtn = document.getElementById("fix-errors");
const errorLogEl = document.getElementById("error-log");

const logEl = document.getElementById("log");

function logLine(kind, text) {
  const div = document.createElement("div");
  div.className = "bw-log-entry " + kind;
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = kind.toUpperCase();
  const span = document.createElement("span");
  span.textContent = text;
  div.appendChild(tag);
  div.appendChild(span);
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function getScope(limited) {
  return {
    project: projectNameEl.value.trim() || "boardwalk-app",
    goal: projectGoalEl.value.trim() || "Build and finish a production-ready full-stack app.",
    stack: stackSelectEl.value,
    allow_scaffold: capScaffoldEl.checked,
    allow_db: capDbEl.checked,
    allow_api: capApiEl.checked,
    allow_auth: capAuthEl.checked,
    allow_media: capMediaEl.checked,
    allow_cloudflare: capCloudflareEl.checked,
    allow_frontend: capFrontendEl.checked,
    allow_service_worker: capServiceWorkerEl.checked,
    allow_deploy: capDeployEl.checked,
    allow_fix: capFixEl.checked,
    mode: limited ? "limited" : "full"
  };
}

async function runAgent(limited) {
  const scope = getScope(limited);
  logLine("system", `Starting agent (${scope.mode}) for project "${scope.project}" with stack "${scope.stack}"`);

  runAgentBtn.disabled = true;
  runLimitedBtn.disabled = true;
  fixErrorsBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scope)
    });
    const data = await res.json();
    (data.events || []).forEach(ev => {
      logLine(ev.kind || "agent", ev.message || "");
    });
    if (data.summary) {
      logLine("system", `Summary: ${data.summary}`);
    }
  } catch (e) {
    logLine("error", "Agent request failed.");
  } finally {
    runAgentBtn.disabled = false;
    runLimitedBtn.disabled = false;
    fixErrorsBtn.disabled = false;
  }
}

async function fixErrors() {
  const project = projectNameEl.value.trim() || "boardwalk-app";
  const errors = errorLogEl.value.trim();
  if (!errors) {
    logLine("system", "No error log provided.");
    return;
  }

  logLine("system", `Submitting error log for project "${project}"`);

  runAgentBtn.disabled = true;
  runLimitedBtn.disabled = true;
  fixErrorsBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/agent/fix_errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, errors })
    });
    const data = await res.json();
    (data.events || []).forEach(ev => {
      logLine(ev.kind || "agent", ev.message || "");
    });
    if (data.summary) {
      logLine("system", `Summary: ${data.summary}`);
    }
  } catch (e) {
    logLine("error", "Error-fix request failed.");
  } finally {
    runAgentBtn.disabled = false;
    runLimitedBtn.disabled = false;
    fixErrorsBtn.disabled = false;
  }
}

runAgentBtn.addEventListener("click", () => runAgent(false));
runLimitedBtn.addEventListener("click", () => runAgent(true));
fixErrorsBtn.addEventListener("click", fixErrors);

logLine("system", "Boardwalk AI Autonomous Builder ready.");
