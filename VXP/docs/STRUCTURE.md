# VXP Structure

## Purpose
This document explains where VXP files belong.

## Root
`VXP/index.html` is the prototype platform landing page.

## src
Application source code.

### src/components
Reusable user interface modules.

Current planned components:
- camera
- gallery
- live-display
- qr

### src/services
Reusable service integrations.

Current planned services:
- airtable
- connect
- ai

### src/pages
Full page-level screens.

Examples:
- admin
- gallery
- launcher

### src/shared
Shared helper functions used across modules.

## config
Configuration files that allow new experiences to be added without copying application code.

### config/experiences
One file per experience.

### config/journeys
Journey-specific behavior and requirements.

### config/prompt-library
Prompt configuration and prompt references.

### config/visual-styles
Colors, backgrounds, logos, and display style choices.

## assets
Static assets such as backgrounds, logos, and icons.

## templates
Reusable templates for experiences, prompts, build sheets, and checklists.

## projects
Project-specific documentation and implementation notes.

## examples
Sample configurations, sample prompts, and sample integration patterns.

## Rule
Shared logic belongs in `src`.
Event-specific settings belong in `config`.
Project-specific notes belong in `projects`.
Reusable documentation belongs in `docs`.
