---
name: vue3-community-admin
description: Initializes a Vue3 + TypeScript + Element Plus + Pinia + Vue Router Web backend project routing and state management with role-based access control for a community elderly service management system.
---

# Vue3 Community Admin Architect

This skill provides an automated workflow to act as a Frontend Architect and initialize the routing and state management for a community elderly service management system.

## Roles Supported

- Family (Role ID: 2)
- Community Merchant (Role ID: 3)
- Community Administrator (Role ID: 4)

## Workflow

When the user asks to initialize the project, you must:

1. Configure `vue-router` with a `/login` page and dynamic role-based routes (`/family`, `/merchant`, `/admin`).
2. Write a global router guard that:
   - Intercepts unauthenticated users and redirects them to `/login`.
   - Parses the `role` field from the JWT token.
   - Implements permission interception and redirects to `{role}/dashboard` upon unauthorized access.
3. Use Pinia to create `useUserStore` that manages user info and the JWT token.
4. Output the complete code for `router/index.ts` and `store/user.ts`.

You can use the provided reference files in `assets/` to generate the code accurately:

- `assets/router_index.ts` -> contains the code for `router/index.ts`
- `assets/store_user.ts` -> contains the code for `store/user.ts`

When outputting, provide the frontend architect's explanation and the complete code text to the user.
