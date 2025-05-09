---
slug: account-management
title: Network Account Management
tags: ['pds']
---

Accounts in the atproto network are app-neutral: a single account can be used for short posts, long-form blogging, events, and more. But until now, the best way for users to create and manage accounts has been through client apps themselves.

We recently shipped new functionality to the PDS reference implementation (and Bluesky's hosting service) which provides a web interface to create and manage accounts directly on the PDS itself. This post describes the new functionality, and what this means for independent app developers and service providers.

### OAuth Account Sign-Up Flow

The PDS reference implementation has included a web interface for authorization flows [since September 2024](https://docs.bsky.app/blog/oauth-atproto), which allowed users to login to OAuth client apps. However, users needed to already have an account. One work-around was to have users create an account using the Bluesky app first, but this was a very awkward onboarding flow, and gave Bluesky Social (the app) an outsized role in the ecosystem.

The PDS now allows users to create new accounts during the OAuth flow where client apps can initiate an auth request to a specific PDS instance without having an account identifier for the user. When they are redirected to the PDS (the OAuth "Auth Server"), they are given the option to create a new account. This includes the full account creation flow: selecting a handle, agreeing to any terms of service, and passing any anti-abuse checks. The user is then prompted to complete the client app authorization flow and will be redirected back to the app once they have signed up.

![Web interface for "pds.example.com", with buttons "Create a new account", "Sign in", and "Cancel". There is a language-selection drop-down menu in the lower right corner.](pds-account-landing.png)

*Web interface for "pds.example.com", with buttons "Create a new account", "Sign in", and "Cancel". There is a language-selection drop-down menu in the lower right corner.*

!["Create Account" web interface, prompting user to "Chose a username" as "Step 1 of 2"](pds-mgmt-sessions.png)

*"Create Account" web interface, prompting user to "Chose a username" as "Step 1 of 2"*

On an independent or self-hosted PDS instance, this process is unbranded and independent of Bluesky Social by default. PDS operators can customize the interface with the `PDS_LOGO_URL`, `PDS_SERVICE_NAME`, and other configuration variables. When using Bluesky's hosting service (`bsky.social`), the flow will indicate that Bluesky (the company) is the hosting provider.

You can experiment with this flow by entering a PDS hostname (or `https://bsky.social`) using the Python Flask OAuth demo at: [https://oauth-flask.demo.bsky.dev/oauth/login](https://oauth-flask.demo.bsky.dev/oauth/login)

### Account Management Interface

The reference implementation's account management interface is at the path `/account`. This specific path does not need to be a protocol norm or requirement, and we intend to make any account management URL machine-discoverable in the future. For an independent PDS at [`pds.example.com`](http://pds.example.com), the full URL would be [https://pds.example.com/account](https://pds.example.com/account). For an account hosted on Bluesky's hosting service, the URL is [https://bsky.social/account](https://bsky.social/account). 

![Web Sign-In interface, asking for "Identifier" and "Password". There is a "Forgot Password?" link, and a language selector drop-down.](pds-mgmt-signin.png)

*Web Sign-In interface, asking for "Identifier" and "Password". There is a "Forgot Password?" link, and a language selector drop-down.*

Users will already be signed in if they have done an OAuth approval flow for an app. If not, they should sign in using their full account password (not an app password). Multiple accounts on the same PDS can be signed in at the same time, with an account selector dialog.  

![Web interface for "Your Account". Shows a list of "Connected apps" (Statusphere React App and OAuth Flask Backend Demo), with "Revoke access" buttons for each. Also has a list of "My Devices", showing "Linux \- Firefox" and "Linux \- Chrome", the latter indicated as "This device", both with "Sign Out" buttons.](pds-mgmt-sessions.png)

*Web interface for "Your Account". Shows a list of "Connected apps" (Statusphere React App and OAuth Flask Backend Demo), with "Revoke access" buttons for each. Also has a list of "My Devices", showing "Linux \- Firefox" and "Linux \- Chrome", the latter indicated as "This device", both with "Sign Out" buttons.*

The account management view currently allows users to view authorized OAuth applications, and a list of devices/browsers which are signed in to the host itself. It does not show password-based auth sessions to apps.

We expect to implement more functionality in this interface in the future. For example, email updates, password changes, and account deactivation, deletion, or migration actions are all application-agnostic and could be implemented here. Additional 2FA methods (such as passkeys, OTP, or hardware dongles) could all be configured through this interface.

The specific design and features for account management are largely left to implementations, and are not specified or required by the protocol. We expect that there will be a common overlap in features provided, but PDS hosting providers are free to innovate and differentiate. Providers might bundle other network services (such as email, calendaring, or web hosting), or implement atproto hosting as a component of existing services (such as blog hosting).

### Other OAuth Progress

The protocol team released an initial [Auth Scopes design sketch in March](https://github.com/bluesky-social/atproto/discussions/3655), and expects to have a working version in the network before long. In the meanwhile, we are planning to introduce an email-specific transitional OAuth scope, which will let OAuth clients access account email addresses and email verification status.

App developers in the ecosystem have been implementing atproto OAuth clients of both the "public" and "confidential" types. While the "public" client type can be easier to implement, we need to emphasize that long-lived auth sessions (eg, more than a couple days or weeks before re-authentication)  are only possible with "confidential" clients. This requires some degree of auth offload to an app server which holds cryptographic private keys and signs token refresh requests. You can read more about this in the "Confidential Client Authentication" section of the [atproto OAuth specifications](https://atproto.com/specs/oauth).
