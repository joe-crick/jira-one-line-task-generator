# Jira One-Line Task Generator

Create multiple Jira tasks for a given Epic by providing a list of Task names.

## Features

- Console-based Inquire.js prompts for ease of data input.
- Sequential processing to avoid rate limits and keep order predictable.
- Simple configuration via configuration file.
- Initial configuration setup.
- Basic success/error logging for each created ticket.

## Prerequisites

- Node.js 18+
- A Jira Cloud (or Server/DC) account with API access and permission to create issues
- An API token (for Jira Cloud) or credentials suitable for Basic auth
- Epic key in which the tasks will be created (Derives the project key from the epic key)

## Installation

1. Install dependencies:

   - Using pnpm (recommended by this repo):
     pnpm install
   - Or using npm:
     npm install

2. Ensure you can run ES Modules. The project uses .mjs files and Node 18+.

## Configuration

Ensure you have the following values available. The application will prompt you
to provide these values at first run, during which it will create a .task-gen.conf
file. It will use this base file moving forward. There is, currently, no applicaiton-
level functionality to update the .task-gen.conf file. You must do so manually, if
you add new Jira projects.
```
JIRA_URI="https://<your-domain>.atlassian.net/rest/api/3/issue"

# Credentials for Basic auth; combined and base64-encoded by the app
# For Jira Cloud, this is usually "email@example.com:<api_token>"
JIRA_AUTH="<email>:<api_token>"

# Jira project keys for the projects you want to create tasks in
JIRA_PROJECTS=ABC,DEF,GHI
```

## Running the script

- Using Node directly:
  node index.mjs

## What gets created

For each title, the script creates a Task issue with:

- Project: PROJECT_KEY
- Parent Epic: JIRA_EPIC
- Summary: title
- Description: a simple paragraph containing the title, or a description if provided. **NOTE** you can create a description
  by placing a ~ between your task title and the description, e.g., "My task~This is my description."

## License

ISC (see package.json)

## Disclaimer

Use responsibly and in accordance with your company policies and Jira terms. Creating many issues at once can be disruptive if misconfigured.
