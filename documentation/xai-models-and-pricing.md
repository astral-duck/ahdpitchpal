# xAI Model Reference & Pricing

This document summarizes the available xAI (Grok) models, their capabilities, context window, and pricing for both input and output tokens.

## Model Table

| Model Name               | Context | Input Price (per 1M) | Output Price (per 1M) | Notes                |
|--------------------------|---------|----------------------|-----------------------|----------------------|
| grok-3, grok-3-latest    | 131072  | $3.00                | $15.00                | Highest performance  |
| grok-3-fast, grok-3-fast-latest | 131072 | $5.00         | $25.00                | Faster variant       |
| grok-3-mini, grok-3-mini-latest | 131072 | $0.30         | $0.50                 | Budget/fastest       |
| grok-3-mini-fast, grok-3-mini-fast-latest | 131072 | $0.60 | $4.00  | Budget, even faster  |
| grok-2, grok-2-latest    | 131072  | $2.00                | $10.00                | Previous gen         |
| grok-2-vision, grok-2-vision-latest | 8192 | $2.00 (text) / $2.00 (image) | $10.00 | Vision support       |
| grok-2-image, grok-2-image-latest | 131072 | $0.07/image  | -                     | Image generation     |
| grok-vision-beta         | 8192    | $5.00 (text/image)   | $15.00                | Vision beta          |
| grok-beta                | 131072  | $5.00                | $15.00                | Beta release         |

## General API Settings

- **Context Window:** Most models support up to 131,072 tokens (except vision/image models).
- **Input/Output Pricing:** Prices are per million tokens unless otherwise specified.
- **Model Selection:** Use the model name as shown above (e.g., `grok-3-latest`).
- **Vision/Image:** Use the `-vision` or `-image` variants for multimodal tasks.

## Model Selection Tips

- Use `grok-3-latest` for best accuracy and RAG support.
- Use `grok-3-mini-latest` for cost efficiency if accuracy is less critical.
- For image or vision tasks, select the appropriate model variant.
- Always confirm that your backend and DB use a valid model string.

_Last updated: 2025-04-25_
