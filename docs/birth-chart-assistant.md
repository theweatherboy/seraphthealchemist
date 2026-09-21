# Birth-chart assistant

The Celestial Companion uses Groq's OpenAI-compatible Chat Completions API with the `openai/gpt-oss-120b` model by default. It explains chart results already calculated by the birth-chart page; it does not calculate new ephemeris positions.

## Configuration

Set `GROQ_API_KEY` in `.env.local` for local development and in the hosting environment for deployment. This is a server-only secret; never use a `NEXT_PUBLIC_` prefix or commit the key. Restart or refresh the development server after changing environment settings. A deployed site needs a new deployment after adding its environment variable.

`GROQ_CHAT_MODEL` optionally overrides the default model. Groq free-plan limits apply to the whole organization and can change; requests are paused when a limit is reached. See [Groq rate limits](https://console.groq.com/docs/rate-limits). The API key is never returned to the browser.

## Data and behavior

- The visitor explicitly sends a message. No Groq request is made just by generating a chart.
- Chat lives in React state; refreshing, clearing, or calculating a different chart resets it. Recent messages are included for follow-ups.
- The server whitelists placements, house data, natal aspects, timezone, and transit events. Raw birth date, birth time, birthplace label, and coordinates are not automatically forwarded. User-entered messages may contain personal information.
- The server ranks up to 60 transit events, prioritizing mentioned planets and months and slower planets for broad questions. It budgets the complete prompt (instructions, chart, and history) to 12,000 UTF-8 bytes, removing oldest exchanges and least relevant transits or aspects as needed. Byte counts are conservative approximations, not exact tokenizer counts. A provider size rejection gets one retry at 8,000 bytes. Current questions and complete natal positions are preserved; dates are never clipped or recomputed, and the supplied-event count is updated. The model is told this is a selection, not an exhaustive calendar, and must not invent missing dates.
- GPT-OSS uses low reasoning effort and a 1,600-token completion budget, including reasoning. Incomplete or empty replies are not displayed as completed answers. Size, authentication, model-access, and rate-limit errors have distinct messages.
- Groq's default reliability and abuse monitoring may retain request content for up to 30 days. Groq documents Zero Data Retention controls for all customers; review and enable them in your Groq console if desired. The privacy policy and chat notice disclose provider processing.
- Conversation roles, input lengths, actual request bytes, and chart fields are validated. There are no model tools or HTML rendering.
- The route limits each IP hash to 12 requests per ten minutes, caps concurrent calls at four per process, and limits reply tokens. These are process-local safeguards, not a distributed quota; configure hosting-level rate limits for wider public traffic.

## Verification

The automated tests mock the Groq API, checking privacy filtering, transit context, conversation roles, and provider failures. A real API reply requires a valid Groq key and available free-tier quota.
