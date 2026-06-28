# USA250v2 Build Sheet

## Document Information
Project: Veytec Experience Platform
Document: USA250v2 Build Sheet
Version: 0.1.0
Status: Draft
Owner: Anthony Cotignola (Product Owner) / ChatGPT (Technical Lead)
Last Updated: 2026-06-28
Audience: Engineering, Product, Operations
Dependencies: 00_PROJECT_VISION.md, 13_STANDARD_EXPERIENCE_FLOW.md

## Overview
USA250v2 is the Friends and Family release of the USA250 AI photo experience.

It allows users to take a picture, use front or rear camera, upload an image, submit to the existing Webex Connect workflow, view their generated USA250 images, and open the live USA250 wall.

## Release
Release: USA250v2 2.0.0-RC1
Status: Release Candidate

## Live URLs
Camera: https://phoneguy94.github.io/0924/USA250v2-CAM/
Photo Gallery: https://phoneguy94.github.io/0924/USA250v2-Photo/
Wall: https://phoneguy94.github.io/0924/USA250-Wall/

## Files
- USA250v2-CAM/index.html
- USA250v2-Photo/index.html
- USA250v2-Wall/index.html

## Architecture
Camera / Upload
-> Webex Connect webhook
-> Airtable
-> AI Image Generation
-> Generated USA250 images
-> Photo Gallery
-> Live Wall

## Features
- Front camera support
- Rear camera support
- Upload image support
- Countdown capture
- Submit to existing webhook
- Personal gallery page
- View Wall button
- Take Another button
- Mobile support
- Desktop support

## Known Issues
- Gallery lookup should use returned Airtable RecordID instead of timestamp/latest-image lookup.
- During simultaneous submissions, users may briefly see the newest completed image before their own appears.
- Airtable read access is currently exposed in client-side JavaScript and must be moved behind a backend or secure service before production/customer use.

## Lessons Learned
- The platform needs a separate Experience Record and Claim Record model.
- The user-facing flow must support multiple people claiming the same generated image.
- The wall and gallery should be reusable components.
- The camera should become a shared component.
- Experience-specific details should move into configuration.

## Future Improvements
- Return RecordID from Webex Connect.
- Add secure backend data access.
- Add download buttons.
- Add automated gallery redirect.
- Add admin hide/pin/delete controls.
- Move USA250 into the Experience Platform configuration model.

## Review Status
Technical Review: Draft
Product Review: Pending
