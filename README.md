# Neural Network Evaluation Log

A simple static GitHub Pages site for a collaborative neural network evaluation
record.

The visible page is intentionally plain: title, project description, research
paper followed, professor in charge, score table, and a lodge data code prompt.
The table data lives in `data/scores.json` so it can be edited without touching
the page layout.

The lodge data code is checked against a hash in the browser. Since this is a
static GitHub Pages site, it is only a light front-end gate, not real
authentication.

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Edit sample rows

Replace the placeholder Person A / Person B rows in `data/scores.json` with real
entries when the project begins.
