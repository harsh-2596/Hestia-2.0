# Cloudflare and local ComfyUI setup

Both integrations remain available. Choose the provider explicitly in **AI tour**; Hestia does not fall back to another provider. API credentials stay in the local server environment and are excluded from Git and project exports.

## Auto Free — curated image models (0.5)

The selector now offers **Auto Free** for images and panoramas. It uses only these ImageRouter candidates:

| Candidate | Role | Admission requirement |
| --- | --- | --- |
| FLUX 2 Klein 4B, black-forest-labs/FLUX-2-klein-4b:free | Geometry-conditioned image editing | Real output inspected and approved for the chosen task |
| Qwen Image 2, qwen/qwen-image-2:free | Geometry-conditioned image editing | Same quality checks; separate panorama/seam approval |

Their ordering is a curated preference, not a measured quality ranking. No candidate is automatically quality-approved on installation. Text-only generators, test models, background-removal tools, unlisted models and unknown/paid prices are excluded. Current image input/output capabilities and min/average/max prices must all pass preflight. A custom 2048 × 1024 size is required for panoramas. Model availability and catalogue claims are checked again for every request; a catalogue failure stops generation.

1. Sign in at [ImageRouter](https://imagerouter.io/) and create an API key through its API Keys page. Check the provider’s free-model limits and terms.
2. Add **IMAGEROUTER_API_KEY=your_private_key** to Hestia’s local .env and restart Hestia. A Cloudflare token is not an ImageRouter key.
3. Open **AI models**. The two candidate cards show live availability and separate room / 360° quality status.
4. For a room image, first enter **Explore → Walkthrough** and choose an interior view. Return to AI models, select a candidate and generate one test image.
5. For a 360° test, first approve the original and a current interior brief in Plan lab. Select panorama and a room in AI models, then generate a candidate output.
6. Inspect the actual capture beside the provider output. Confirm preserved layout/openings/furnishings, convincing materials, coherent lighting and acceptable realism. Panoramas also require inspecting the joining seam and full projection in the spherical viewer. Approve only a satisfactory result. An image must actually complete through the curated adapter; a failed job or an invented job ID cannot qualify a model.
7. Select **Auto Free** in AI tour or Explore. It picks only a quality-approved compatible candidate. The first model selected for a floor batch stays pinned throughout that batch; if it becomes unavailable or its price cannot be confirmed free, generation stops. Failures/429s do not trigger blind retries, provider switching or paid fallback.
8. Remove a quality approval in AI models if the model no longer meets your expectations. Room approval does not approve panoramas, and neither substitutes for approving a particular room as the floor-tour pilot.

Approvals are your local acceptance records, not independent benchmark results. They are stored in .hestia-data/model-quality/approved.json and reference the real reviewed job. Actual provider/model, requested routing strategy and the pricing-check time are saved with each render. Back up the data folder. Keep the model key private.

ImageRouter requests ephemeral base64 output so Hestia does not follow provider-supplied remote image URLs. Upstream providers may still retain requests under their own policies. Free catalogue pricing is not a guarantee of permanent availability or a contractual guarantee against third-party billing errors; verify your provider dashboard. The integration never selects a known-paid endpoint. See [ImageRouter model metadata](https://docs.imagerouter.io/api-reference/models/) and [image API](https://docs.imagerouter.io/api-reference/image-generation/).

## OpenRouter — curated free plan/design vision

OpenRouter is available separately in **Plan lab → Plan and design AI → OpenRouter · curated free vision**. This performs plan analysis, alternatives and design directions; it does not generate images.

1. Create your own OpenRouter API key through [OpenRouter settings](https://openrouter.ai/settings/keys).
2. Add **OPENROUTER_API_KEY=your_private_key** to .env and restart Hestia.
3. Choose OpenRouter in Plan lab before using a selected-AI action. Only verified-free, image-aware, structured-JSON models from the curated shortlist are eligible: Gemma 4 31B and Nemotron 3.5 Super VL free variants. Each request sends zero prompt/completion/request/image price caps and disables provider fallback. Existing local geometry validation still applies; outputs remain unapproved drafts.

No free OpenRouter image generator was verified in the researched catalogue. Hestia does not send image-generation requests to its generic free text/vision router. See [OpenRouter free routing](https://openrouter.ai/docs/guides/routing/routers/free-router).

## Start Hestia

Use Node.js 20.16 or newer (Node 24 LTS recommended). In the folder containing `package.json`:

```powershell
npm.cmd ci
Copy-Item .env.example .env
notepad .env
npm.cmd start
```

Copy the example only if `.env` does not already exist. Preserve your existing settings when updating. Open http://127.0.0.1:4173. After changing `.env`, stop Hestia with Ctrl+C and start it again. Never put tokens in this chat, a project JSON, screenshots or a public repository.

## Cloudflare — selected first option

1. Sign in to your own [Cloudflare dashboard](https://dash.cloudflare.com/).
2. Open **Workers AI → Use REST API**. Use **Create a Workers AI API Token** and copy the account ID. The template is preferable; a custom token needs Workers AI Read and Edit permissions for the selected account. See the [official REST setup guide](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).
3. For free usage, keep the account on **Workers Free**. The service provides a shared daily allocation of 10,000 Neurons; on Free, requests fail at the limit. A Workers Paid account can incur usage charges beyond its allocation. Hestia cannot change or enforce the Cloudflare account’s billing plan. See [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
4. Set these values privately in `.env`:

```dotenv
CLOUDFLARE_ACCOUNT_ID=your_32_character_account_id
CLOUDFLARE_API_TOKEN=your_private_workers_ai_token
```

5. Restart Hestia. In **AI tour**, Cloudflare should say **configured**. This means settings are present, not that account access or model quality has been verified.
6. In **Plan lab**, review the original model, confirm measurements/elements, and approve it. Confirm room uses, main entrance, budget amount/currency/scope and permitted changes. Confirm north only from a real source; “UP” on stairs is not north.
7. Apply a reviewed layout and approve its interior brief. Open **AI tour**, select Cloudflare and a room, then generate one panorama. Inspect doors, windows, ceiling, projection and the left/right seam. Approve that room as the pilot only if satisfactory. **Extend approved design across floor** then becomes available.

Cloudflare SDXL receives a spherical capture of the actual current model, not an unrelated room prompt. The configured model is [`@cf/stabilityai/stable-diffusion-xl-base-1.0`](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-base-1.0/), with image-to-image input at 2048 × 1024 and low denoising strength. It is a general image model, not a guaranteed geometry-preserving panorama model. A 2:1 result can still contain warped geometry or visible seams. Human pilot approval is required; no quality guarantee is implied by a completed API call.

**Plan lab AI actions:** Cloudflare Gemma 4 proposes a cropped-plan reconstruction, structured alternatives and three design directions. You choose the crop before sending; exclude title blocks and personal details. Local validation rejects empty/invalid geometry and locked-element changes. AI drafts always remain reviewable, not automatically approved. The local straight-line detector works without a token and explicitly reports uncertainty. Gemma vision and schema responses require a live account test; contract tests alone do not prove recognition quality.

## ComfyUI — optional local generation

1. Install [official ComfyUI](https://www.comfy.org/download), or follow the [official manual installation guide](https://docs.comfy.org/installation/manual_install). Choose the installation suitable for your GPU/OS. Hestia does not install GPU drivers, Python environments or model weights.
2. Install an SD/SDXL-compatible checkpoint supported by ComfyUI’s standard **CheckpointLoaderSimple** node. Put the model in `ComfyUI/models/checkpoints/` and respect its licence. This adapter is not a universal FLUX/SD3/custom-workflow adapter.
3. Start ComfyUI locally. For a manual install:

```powershell
python main.py --listen 127.0.0.1 --port 8188
```

4. Open http://127.0.0.1:8188 and verify the checkpoint appears and a normal image workflow works.
5. In Hestia’s `.env`, enter the exact checkpoint filename shown by ComfyUI:

```dotenv
HESTIA_COMFYUI_URL=http://127.0.0.1:8188
HESTIA_COMFYUI_CHECKPOINT=your-installed-checkpoint.safetensors
```

6. Restart Hestia. Select **Local ComfyUI** in **AI tour**, generate one room, inspect it and approve before extending. Keep both applications running. This has no hosted API fee; hardware, electricity and any model licence costs are yours. Performance and available memory depend on the PC; local GPU inference was not verified on the development machine.

The adapter uploads the model capture, queues a standard image-to-image workflow, polls `/history`, and downloads the result from `/view`. Only loopback service URLs are accepted. A timed-out HTTP request can leave a ComfyUI job in its queue: inspect the ComfyUI queue before retrying. There is no automatic retry or provider switch.

## References, saved jobs and troubleshooting

- These two panorama adapters accept one geometry image. To use a Pinterest-style reference, upload/crop it in **Explore → Reference** and apply it as a finish before capture. Describe desired furniture/style in the brief. A second reference photograph is supported by the existing paid flat-image adapters, not these free/local panorama workflows.
- The local brief accepts custom instructions even when none of the suggested directions fit. Material hover shows saved/proposed specifications and Unknown composition; double-click a model object to correct its saved specification. It labels saved AI-estimate records as unverified, but does not generate them automatically. it does not scientifically identify a material from its colour. AI material segmentation/estimation is not implemented.
- Projects contain separate original, alternatives, context, report, responses and brief records. Source/result images and render metadata live in `.hestia-data/renders/`. Back up the entire data directory to preserve the tour; project exports do not embed the render collection.
- The spherical viewer supports drag look-around, zoom, room navigation and doorway hotspots when a current target panorama exists. It is linked panoramas, not an AI-generated navigable 3D mesh.
- A changed layout/room use or approved brief makes previous panorama jobs stale. North/input changes invalidate Vastu reports. Conflicting placement remains Conflict after recording a remedy.
- **Not configured:** fill the matching variables and restart the Node server. Never paste keys into the browser.
- **401/403:** check token permissions, account ID, model availability and account access.
- **429/quota:** wait for quota reset or review your account. Hestia will not activate a paid plan.
- **No valid alternatives:** review uncertain room purposes, the entrance, access routes and fixed geometry. Fewer proposals are preferable to invalid or duplicate plans.
- **AI geometry rejected:** no draft is installed. Correct the crop/scale, retry deliberately or trace/correct manually.
- **Panorama rejected:** the result must be PNG with 2:1 dimensions, at least 512 × 256. Passing this check does not validate seams or geometry.
- **Live validation status:** no Cloudflare token or ComfyUI checkpoint was configured during this release. No real AI panorama is claimed in the evidence.


## Small conversion stages (0.6)

Plan lab now sends separate calibrated room-label, opening and fixed-object tasks. Select Cloudflare or curated free OpenRouter explicitly, then run/resume that stage. Each crop is at most 1024 pixels per side, each request has a 60 second timeout and a 1,500 output-token cap. Successful crops and failed-stage diagnostics persist privately. Errors never trigger automatic inference retries or another provider. No API key is needed for local wall/space detection. Cloudflare disables thinking for these compact tasks; a live cropped-plan label request was verified, while semantic accuracy still requires review. General image generation retains its existing setup and limits.
