---
name: vue3-login-component
description: Creates a modern, lightweight, and minimalistic Login component for Vue3 + Element Plus. Calling this skill will generate a beautifully designed Login.vue component.
---

# Vue3 Login Component Builder

This skill generates a highly polished, modern, and minimalistic `Login.vue` component using Vue 3 (`script setup`), TypeScript, and Element Plus. The design aligns with `ui-ux-pro-max` guidelines for a lightweight, card-based interface.

## Workflow

When the user asks to create the login component, you must instantiate the reference code provided in `assets/Login.vue` exactly as it is, adapting the path as requested by the user.

1. Ensure the component has a centered card UI.
2. The form includes Account, Password, and a Role selection radio group (Merchant, Family, Admin).
3. Ensure the placeholder `family_zhangsan_son` is used for the account input.
4. Input validation (4-20 length, alphanumeric + underscore for account, non-empty for password) is handled via Element Plus form rules.
5. On submit, `useUserStore().setToken()` is called mockingly, routing the user to `/family`, `/merchant`, or `/admin` depending on the selected role.
6. The required disclaimer text "* 首次登录请使用管理员分配的初始密码" is placed at the bottom.

Use the complete source code from `assets/Login.vue` to fulfill the user's request.
