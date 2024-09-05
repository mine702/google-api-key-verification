# Google API Key Verification

A simple library to check which Google APIs a given API key has access to.

## Features
- Verify access to all Google APIs with a given API key.
- Check access for a specific Google API by title.

## Usage

```javascript

function

checkApiKeyForSpecificApi(apiKey, apiTitle);
checkApiKeyPermissions(apiKey);

return
{
    success:[{ title: String, name: String, id: String }], 
        fail:[{ title: String, name: String, id: String }]
}

```

## Installation

```bash
npm install google-api-key-verification
```
