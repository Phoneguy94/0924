# Engineering Standards

## Document Information
Project: Veytec Experience Platform
Document: Engineering Standards
Version: 0.1.0
Status: Draft
Owner: Anthony Cotignola (Product Owner) / ChatGPT (Technical Lead)
Last Updated: 2026-06-28
Audience: Engineering, Product, Future Contributors
Dependencies: 00_PROJECT_VISION.md, 05_PLATFORM_ARCHITECTURE.md

## Purpose
This document defines how the Veytec Experience Platform should be built and maintained.

## Core Engineering Principles

### 1. Modular Code Over Giant Files
Avoid building new experiences as one large HTML file containing all HTML, CSS, and JavaScript.

The platform should move toward reusable modules:
- Shared Camera module
- Shared Gallery module
- Shared Wall module
- Shared configuration loader
- Shared Airtable/Webex integration patterns
- Shared QR and claim flow logic
- Shared theme and asset handling

### 2. Reuse Before Rebuild
Before creating new code, check whether an existing component, pattern, or configuration can be reused.

If multiple experiences need the same behavior, that behavior belongs in a shared module.

### 3. Configuration Over Customization
New events should be created by configuration whenever possible.

A new event should not require copying and editing large HTML files.

### 4. Start Simple, Then Modularize
Do not over-engineer the first platform release.

The first goal is practical modularity, not unnecessary complexity.

Good starting modules:
- camera.js
- gallery.js
- wall.js
- config.js
- airtable.js
- webexConnect.js
- theme.css

### 5. Security First
No secrets, Airtable tokens, or privileged API keys should live in client-side JavaScript for production/customer deployments.

### 6. Documentation Is Part of the Feature
A feature is not complete until the relevant documentation is updated.

## Recommended Initial Platform File Structure

```text
ExperiencePlatform/
  components/
    camera/
    gallery/
    wall/
    qr/
  services/
    airtable/
    webex-connect/
    ai-agent/
  config/
    experiences/
    themes/
  assets/
    backgrounds/
    icons/
    logos/
  docs/
```

## Code Reuse Rules
- Do not duplicate camera logic for every event.
- Do not duplicate wall rendering logic for every event.
- Do not hardcode event-specific prompts inside shared components.
- Do not hardcode event-specific Airtable fields inside UI components.
- Prefer one shared component with event-specific configuration.

## Product Decisions
- PD-003: The platform must support rapid deployment through configuration.
- PD-005: Shared components should replace repeated one-off HTML files.

## Open Questions
- Should the first platform build use plain JavaScript modules or a lightweight framework later?
- Should USA250v2 be refactored into the platform or left as a stable proof of concept?
- What is the minimum set of modules needed before creating the next experience?

## Review Status
Technical Review: Draft
Product Review: Pending
