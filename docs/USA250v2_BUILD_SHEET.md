# USA250v2 Build Sheet

## Project

USA250v2 — Friends & Family Edition

## Status

Release Candidate 1

## Purpose

Internal/friends/family/coworker version of the USA250 kiosk experience.

Users can take or upload a photo, submit it to the existing Webex Connect workflow, view their generated USA250 images, and open the USA250 Wall.

## Live URLs

Camera:
https://phoneguy94.github.io/0924/USA250v2-CAM/

Photo Gallery:
https://phoneguy94.github.io/0924/USA250v2-Photo/

Wall:
https://phoneguy94.github.io/0924/USA250-Wall/

## Files Created

USA250v2-CAM/index.html
USA250v2-Photo/index.html
USA250v2-Wall/index.html

## Features Completed

* Front camera support
* Back camera support
* Image upload support
* Countdown capture
* Submit to existing Webex Connect webhook
* Personal photo gallery page
* View Wall button
* Mobile support
* Desktop support
* Existing USA250 Wall still works

## Current Architecture

Camera / Upload
→ Webex Connect webhook
→ Airtable record
→ AI image generation
→ Airtable image fields
→ Photo Gallery
→ USA250 Wall

## Known Issues

* Photo page currently uses timestamp lookup if Webex Connect does not return a RecordID.
* If multiple users submit close together, the gallery may briefly show the newest finished image before the correct one appears.
* Best future fix: Webex Connect should return the Airtable RecordID immediately after creating the record.

## Future Improvements

* Return RecordID from Webex Connect
* Auto-open gallery after submit
* Add download buttons
* Add admin hide/delete/pin capability
* Move Airtable token out of public JavaScript
* Convert into configurable Veytec Experience Engine

## Release Notes

USA250v2 RC1 proves the core reusable flow:

Camera
→ Webhook
→ AI
→ Gallery
→ Wall

This becomes the foundation for the future Veytec Experience Engine.
