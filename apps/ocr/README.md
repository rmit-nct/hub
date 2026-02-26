# OCR Service (`apps/ocr`)

FastAPI microservice that extracts a student name and 7 digit ID from captured ID card images. It uses PaddleOCRVL running on CPU, cleans the recognized text, and exposes one `POST /capture` endpoint that frontend apps (for example `apps/web` via `src/app/api/capture/route.ts`) can call.

## Purpose

- Provide a thin, inspectable OCR layer that the web experience or any other client can call over HTTP.
- Keep OCR specific dependencies (PaddleOCR, OpenCV, NumPy) inside a dedicated Python workspace so the rest of the monorepo stays on Bun/Next.js tooling.
- Normalize noisy OCR output by removing keywords (RMIT markers, month names) and formatting uppercase names before returning `{ "name": string, "studentNumber": string }`.

## Tech Stack

| Area | Details |
| --- | --- |
| API | FastAPI + Uvicorn with permissive CORS configured in `main.py`. |
| OCR | `PaddleOCRVL(device="cpu")` from PaddleOCR/PaddlePaddle, confidence filtered at 0.5 and executed in a worker thread. |
| Image processing | OpenCV (`cv2`) + NumPy arrays created from base64 encoded frames sent by the client. |
| Data cleaning | Regex based extraction that strips reserved keywords/months before matching a name + 7 digit ID. |
| Packaging | `requirements.txt` pins FastAPI, Modal, NumPy, OpenCV, PaddleOCR, PaddlePaddle for reproducible installs. |
| Deployment | Modal serverless with image defined in `modal_deployment.py`, 2 CPU / 2 GB RAM, up to 100 concurrent invocations. |

## API Contract

`POST /capture`

```jsonc
// Request body
{ "imageData": "data:image/png;base64,..." }

// Success
{ "name": "John Doe", "studentNumber": "1234567" }

// Fallback when no confident match is found
{
	"error": "No match found in the provided ID data",
	"extracted_text": "raw ocr text",
	"debug": true
}
```

Errors are returned as FastAPI `HTTPException`s (400 for bad input, 500 for unexpected failures). The Next.js proxy at `apps/web/src/app/api/capture/route.ts` simply forwards client payloads to this endpoint.

## Local Development

Prerequisites: Bun (1.3.9 per workspace), Node.js 22+, Conda (any distribution) for creating the `.conda` environment, and system packages required by OpenCV (on Linux install `libgl1-mesa-glx` and `libglib2.0-0`).

1. Install monorepo dependencies once: `bun install` at the repo root.
2. Enter the OCR workspace: `cd apps/ocr`.
3. Create the Conda env (one time): `bun run init`. This uses `script.js` to run `conda create -p ./.conda python=3.12.12`.
4. Install Python packages: `bun run install` (runs `pip install -r requirements.txt` inside the env).
5. Start the dev server:
	 - From the repo root: `bun dev:ocr` to let Turbo run the `dev` task for `@ncthub/ocr`.
	 - Or directly inside `apps/ocr`: `bun run dev`, which calls `uvicorn main:app --host 127.0.0.1 --port 5500 --reload`.

The service listens on `http://127.0.0.1:5500`. Web clients should set `OCR_SERVICE_URL=http://127.0.0.1:5500` (see `.env` usage in `turbo.json` and the web app) so their proxy route forwards to the local server.

## Modal Deployment

`modal_deployment.py` defines the deployment image and app:

- Base image: Debian slim with `libgl1-mesa-glx` and `libglib2.0-0` added.
- Installs everything from `requirements.txt` and copies the local `main` module.
- Exposes `fastapi_app` via `@modal.asgi_app()` with 2 CPU, 2 GB RAM, `max_inputs=100` concurrency.

Typical workflow (all commands run from `apps/ocr`, but also exposed via `bun run dev:ocr` scripts):

1. `bun run init` / `bun run install` if you have not prepared the env.
2. `bun run run` &mdash; executes `modal run modal_deployment.py` for one off tasks or debugging.
3. `bun run serve` &mdash; calls `modal serve modal_deployment.py` to run the FastAPI app locally through Modal tunnels.
4. `bun run deploy` &mdash; deploys the app to Modal’s cloud and returns the public URL.

Ensure Modal credentials are available via `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` (listed in `turbo.json` `globalEnv`). After deployment, set `OCR_SERVICE_URL` to the Modal endpoint so consuming apps hit the hosted service.

## Troubleshooting

- **Virtual env missing**: any command except `init` auto creates `.conda`. If Conda is not on PATH, install Miniconda/Mambaforge first.
- **OCR accuracy**: adjust regex patterns or excluded keywords in `extract_info` inside `main.py` for other document formats.
- **OpenCV display errors**: install desktop OpenCV deps (`libgl1-mesa-glx`, `libglib2.0-0`) or run inside Modal where they are already included.
- **Modal auth**: run `modal token new` locally, then export `MODAL_TOKEN_ID`/`MODAL_TOKEN_SECRET` before invoking `bun run serve/deploy`.

With these steps you can iterate locally, proxy requests from the Next.js app during development, and deploy the OCR microservice to Modal when ready.
