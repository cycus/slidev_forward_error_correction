# Deploying the deck

The deck is built and published by GitHub Actions
(`.github/workflows/deploy.yml`), not locally — `slidev build`/`export` stall in
the authoring sandbox. On every push to `main` the workflow builds the static
SPA, publishes it to GitHub Pages, and attaches an exported PDF as a downloadable
artifact.

**Live URL:** https://cycus.github.io/slidev_forward_error_correction/

## One-time manual setup (human, in the GitHub UI)

These cannot be done from the sandbox and only need to be done once:

1. **Settings → Pages → Source = "GitHub Actions"** (not "Deploy from a branch").
   The workflow uses `actions/deploy-pages`, which requires this source.
2. **Settings → Actions → General → Actions permissions** — ensure Actions are
   allowed to run for this repository. If your build ever needs it, also confirm
   Workflow permissions allow read/write.

## Pushing the local commits

The sandbox has no cached git credentials, so it cannot push. Any local commits
(`main` is ahead of `origin`) must be pushed by you from your own machine:

```
git push origin main
```

The push to `main` is what triggers the workflow.

## Downloading the exported PDF

After a workflow run: open the run from the **Actions** tab → scroll to
**Artifacts** → download **`slides-export-pdf`**. (The PDF export is best-effort:
if a CI export is flaky it is skipped without blocking the Pages deploy, so a
given run may not have a PDF.)

## Notes

- Aspect ratio is 16:9 only.
- The built SPA is served under the base path
  `/slidev_forward_error_correction/`; the workflow sets this via
  `--base /slidev_forward_error_correction/`.
