# Home Run Derby backend setup

The Airtable structure and Google Apps Script backend code are ready. Complete these steps once.

## 1. Create an Airtable personal access token

In Airtable, open Developer Hub → Personal access tokens → Create token.

Give it these scopes:

- `data.records:read`
- `data.records:write`
- `schema.bases:read`

Grant access to the Home Run Derby base (`appmyn676TqWAAbJs`).

Copy the token. Do not paste it into GitHub or the public website.

## 2. Create the Apps Script project

1. Open https://script.google.com
2. Click **New project**.
3. Rename it **Home Run Derby API**.
4. Replace the default `Code.gs` with the contents of this repository's `backend/Code.gs`.

## 3. Add protected Script Properties

In Apps Script:

1. Click **Project Settings**.
2. Under **Script Properties**, add:
   - `AIRTABLE_TOKEN` = your Airtable personal access token
   - `ADMIN_PIN` = a private commissioner PIN you choose

## 4. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Choose **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Click **Deploy** and authorize the project.
6. Copy the `/exec` URL.

## 5. Test the backend

Open this in a browser, replacing the URL:

`YOUR_APPS_SCRIPT_EXEC_URL?action=bootstrap`

You should receive JSON containing:

- `questions`
- `participants`
- `settings`

## 6. Connect the public website

The `/exec` URL will be inserted into the website as its API endpoint. The Airtable token remains private inside Apps Script.
