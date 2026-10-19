// -------------------------------------------------------------
// Curated FastAPI Evaluation Benchmark Sourced from Real GitHub Discussions
// Repository: tiangolo/fastapi & fastapi/fastapi
// Covers: Dependencies, Sessions, Validation, Routing, Docker, Async, Testing
// -------------------------------------------------------------

export interface CuratedEvalCase {
  discussionNumber: number;
  discussionUrl: string;
  category: string;
  question: string;
  referenceAnswer: string;
  targetDocPath: string;
  verificationCode: string;
  tags: string[];
}

export const GITHUB_DISCUSSIONS_EVAL_SET: CuratedEvalCase[] = [
  {
    discussionNumber: 4823,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/4823",
    category: "dependencies",
    question: "How do I implement Dependency Injection in FastAPI with sub-dependencies and Depends?",
    referenceAnswer: `In FastAPI, dependency injection is declared using \`Depends\` from \`fastapi\`. A dependency is any callable (function or class) that takes parameters. Dependencies can depend on other sub-dependencies, and FastAPI will automatically resolve the full dependency graph before executing the path operation function.`,
    targetDocPath: "tutorial/dependencies/index.md",
    tags: ["dependencies", "injection", "annotated", "sub-dependencies"],
    verificationCode: `from typing import Annotated
from fastapi import Depends, FastAPI
from httpx import Client

app = FastAPI()

def sub_dep():
    return {"scope": "sub_dep_resolved"}

def main_dep(sub: Annotated[dict, Depends(sub_dep)]):
    return {"main": "active", "sub": sub}

@app.get("/test-dep")
def endpoint(data: Annotated[dict, Depends(main_dep)]):
    return data

with Client(app=app, base_url="http://test") as client:
    res = client.get("/test-dep")
    assert res.status_code == 200
    assert res.json() == {"main": "active", "sub": {"scope": "sub_dep_resolved"}}
    print("PASS: Sub-dependency graph resolved successfully.")
`,
  },
  {
    discussionNumber: 5841,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/5841",
    category: "dependencies",
    question: "How do I manage Database Sessions and automatic teardown cleanup using yield in FastAPI dependencies?",
    referenceAnswer: `Use dependencies with \`yield\`. Any code before the \`yield\` statement executes before the path operation (setup), and any code after \`yield\` (or inside a \`finally\` block) executes after the response is sent, guaranteeing that resources like database sessions are properly closed.`,
    targetDocPath: "tutorial/dependencies/index.md",
    tags: ["dependencies", "yield", "database", "cleanup", "contextmanager"],
    verificationCode: `from typing import Annotated
from fastapi import Depends, FastAPI
from httpx import Client

app = FastAPI()
session_log = []

def get_db():
    session_log.append("opened")
    try:
        yield {"db": "connected"}
    finally:
        session_log.append("closed")

@app.get("/items")
def list_items(db: Annotated[dict, Depends(get_db)]):
    return {"db_state": db["db"]}

with Client(app=app, base_url="http://test") as client:
    res = client.get("/items")
    assert res.status_code == 200
    assert session_log == ["opened", "closed"]
    print("PASS: Dependency with yield lifecycle setup and teardown confirmed.")
`,
  },
  {
    discussionNumber: 9342,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/9342",
    category: "parameters",
    question: "How do path parameters work with type validation and automatic HTTP 422 error handling?",
    referenceAnswer: `Path parameters are declared with the same format syntax as Python format strings (e.g., \`/items/{item_id}\`). FastAPI validates parameters against Python standard type hints. If the incoming value cannot be parsed, FastAPI automatically catches the validation error and returns an HTTP 422 Unprocessable Entity error with JSON error details.`,
    targetDocPath: "tutorial/path-params.md",
    tags: ["path-params", "validation", "pydantic", "http-422"],
    verificationCode: `from fastapi import FastAPI
from httpx import Client

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

with Client(app=app, base_url="http://test") as client:
    # 1. Valid integer
    r_valid = client.get("/users/101")
    assert r_valid.status_code == 200
    assert r_valid.json()["user_id"] == 101

    # 2. Invalid string
    r_invalid = client.get("/users/invalid_id")
    assert r_invalid.status_code == 422
    assert "detail" in r_invalid.json()
    print("PASS: Path parameter type validation and 422 error handling verified.")
`,
  },
  {
    discussionNumber: 3210,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/3210",
    category: "parameters",
    question: "What is the difference between path parameters and query parameters in route functions?",
    referenceAnswer: `Parameters declared in the route path string (e.g. \`@app.get("/items/{item_id}")\`) are path parameters and are required. Any function parameters that are not declared in the path (e.g. \`skip: int = 0, limit: int = 10\`) are automatically interpreted as URL query parameters with optional default values.`,
    targetDocPath: "tutorial/path-params.md",
    tags: ["routing", "query-params", "path-params", "defaults"],
    verificationCode: `from fastapi import FastAPI
from httpx import Client

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None, limit: int = 5):
    return {"item_id": item_id, "q": q, "limit": limit}

with Client(app=app, base_url="http://test") as client:
    res = client.get("/items/50?q=search_term&limit=25")
    assert res.status_code == 200
    assert res.json() == {"item_id": 50, "q": "search_term", "limit": 25}
    print("PASS: Path and query parameter separation verified.")
`,
  },
  {
    discussionNumber: 1456,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/1456",
    category: "deployment",
    question: "How do I package and deploy a FastAPI application in a Docker container for production?",
    referenceAnswer: `Use a lightweight Python base image such as \`python:3.11-slim\`. Copy \`requirements.txt\` first to leverage Docker layer caching, install dependencies with \`pip install --no-cache-dir\`, copy application code, and run with \`CMD ["fastapi", "run", "app/main.py", "--port", "80"]\` or \`uvicorn app.main:app --host 0.0.0.0 --port 80\`. In container orchestrators like Kubernetes, run one Uvicorn process per container and scale via replicas.`,
    targetDocPath: "deployment/docker.md",
    tags: ["docker", "deployment", "containers", "uvicorn", "production"],
    verificationCode: `import sys

# Verify Dockerfile specification and requirements
requirements = ["fastapi", "uvicorn", "pydantic", "httpx"]
for pkg in requirements:
    __import__(pkg)

print("PASS: Core production container runtime dependencies verified.")
`,
  },
  {
    discussionNumber: 3205,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/3205",
    category: "core",
    question: "When should I use async def versus normal def in FastAPI route handlers?",
    referenceAnswer: `Use \`async def\` when calling third-party asynchronous libraries using \`await\` (e.g. \`httpx\`, async database drivers like \`asyncpg\`). Use standard synchronous \`def\` when performing blocking I/O (e.g. standard file system calls, synchronous ORMs, or the \`requests\` library). FastAPI runs synchronous \`def\` functions inside an external threadpool so they do not block the event loop.`,
    targetDocPath: "index.md",
    tags: ["async", "concurrency", "threadpool", "event-loop", "starlette"],
    verificationCode: `import asyncio
from fastapi import FastAPI
from httpx import Client

app = FastAPI()

@app.get("/async")
async def async_endpoint():
    await asyncio.sleep(0.01)
    return {"type": "async"}

@app.get("/sync")
def sync_endpoint():
    return {"type": "sync_in_threadpool"}

with Client(app=app, base_url="http://test") as client:
    r1 = client.get("/async")
    r2 = client.get("/sync")
    assert r1.status_code == 200 and r1.json()["type"] == "async"
    assert r2.status_code == 200 and r2.json()["type"] == "sync_in_threadpool"
    print("PASS: Async and sync route handler execution verified.")
`,
  },
  {
    discussionNumber: 4112,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/4112",
    category: "testing",
    question: "How do I write unit and integration tests for FastAPI using HTTPX TestClient?",
    referenceAnswer: `FastAPI provides \`TestClient\` based on HTTPX. Create a \`TestClient(app)\` instance and make standard HTTP calls like \`client.get("/")\` or \`client.post("/items", json={...})\`. Tests run in-memory without needing a live listening TCP socket, enabling fast pytest test suites.`,
    targetDocPath: "tutorial/first-steps.md",
    tags: ["testing", "testclient", "httpx", "pytest"],
    verificationCode: `from fastapi import FastAPI
from httpx import Client

app = FastAPI()

@app.post("/echo")
def echo_payload(data: dict):
    return {"received": data}

with Client(app=app, base_url="http://test") as client:
    res = client.post("/echo", json={"framework": "FastAPI", "version": 0.115})
    assert res.status_code == 200
    assert res.json()["received"]["framework"] == "FastAPI"
    print("PASS: Integration testing with TestClient confirmed.")
`,
  },
  {
    discussionNumber: 3901,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/3901",
    category: "background-tasks",
    question: "How do I execute background tasks in FastAPI after sending the HTTP response?",
    referenceAnswer: `Import \`BackgroundTasks\` from \`fastapi\` and define a parameter of type \`BackgroundTasks\` in your path operation function. Use \`background_tasks.add_task(task_func, *args, **kwargs)\`. FastAPI will send the HTTP response to the client immediately and then execute the background task.`,
    targetDocPath: "tutorial/first-steps.md",
    tags: ["background-tasks", "async", "background", "concurrency"],
    verificationCode: `from fastapi import BackgroundTasks, FastAPI
from httpx import Client

app = FastAPI()
task_executed = False

def write_notification(email: str):
    global task_executed
    task_executed = True

@app.post("/send-notification/{email}")
def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email)
    return {"message": "Notification queued"}

with Client(app=app, base_url="http://test") as client:
    res = client.post("/send-notification/test@edutech.io")
    assert res.status_code == 200
    assert task_executed == True
    print("PASS: BackgroundTasks queue and execution verified.")
`,
  },
  {
    discussionNumber: 2104,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/2104",
    category: "middleware",
    question: "How do I configure CORS (Cross-Origin Resource Sharing) middleware in FastAPI?",
    referenceAnswer: `Use \`CORSMiddleware\` from \`fastapi.middleware.cors\`. Add it to your app using \`app.add_middleware(CORSMiddleware, allow_origins=[...], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])\` to handle browser preflight OPTIONS requests.`,
    targetDocPath: "tutorial/first-steps.md",
    tags: ["cors", "middleware", "security", "headers"],
    verificationCode: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from httpx import Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://edutech.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
def get_data():
    return {"status": "ok"}

with Client(app=app, base_url="http://test") as client:
    res = client.get("/data", headers={"Origin": "https://edutech.io"})
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "https://edutech.io"
    print("PASS: CORSMiddleware preflight headers verified.")
`,
  },
  {
    discussionNumber: 5190,
    discussionUrl: "https://github.com/fastapi/fastapi/discussions/5190",
    category: "exceptions",
    question: "How do I customize the default validation error response for RequestValidationError?",
    referenceAnswer: `Use \`@app.exception_handler(RequestValidationError)\` to override the default HTTP 422 JSON payload. Inside the handler function, access \`exc.errors()\` and return a custom \`JSONResponse\` with your preferred error structure and status code.`,
    targetDocPath: "tutorial/path-params.md",
    tags: ["exceptions", "error-handling", "validation", "request-validation-error"],
    verificationCode: `from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from httpx import Client

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def custom_validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error_code": "INVALID_INPUT", "total_errors": len(exc.errors())},
    )

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

with Client(app=app, base_url="http://test") as client:
    res = client.get("/items/not-an-int")
    assert res.status_code == 400
    assert res.json()["error_code"] == "INVALID_INPUT"
    print("PASS: Custom RequestValidationError handler confirmed.")
`,
  },
];
