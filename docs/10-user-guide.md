# User Guide

This guide walks through TaskFlow as an end user. For setup instructions,
see [`11-installation-guide.md`](11-installation-guide.md).

## 1. Creating an account

1. Open TaskFlow and click **Create an account** on the login screen.
2. Enter your name, email, and a password (at least 8 characters, with one
   uppercase letter and one number).
3. You're signed in immediately and taken to your **Dashboard**.

> **Try the demo accounts instead:** `admin@taskflow.dev`,
> `alice@taskflow.dev`, or `brian@taskflow.dev`, all with password
> `Password123!`, pre-loaded with a sample project (run `npm run seed`
> first — see the Installation Guide).

## 2. Creating a project

1. From the Dashboard, click **+ New project**.
2. Give it a name and (optionally) a description.
3. You're automatically the project's **owner** and its first member.

## 3. Adding teammates

1. Open your project and click **+ Add member**.
2. Enter the teammate's email address (they must already have a TaskFlow
   account).
3. They'll immediately see the project on their own Dashboard.

Only the project **owner** can add or remove members, or rename/delete the
project — everyone else is a **contributor**, who can create, view, and
update tasks but not manage membership.

## 4. Working with tasks

**Creating a task:** click **+ New task** inside a project, fill in a
title (required), description, priority, and optionally assign it to a
project member.

**Moving a task:** drag a task card between the **To do**, **In
progress**, and **Done** columns. If you'd rather not drag, open the task
(click its card) and change the **Status** dropdown instead — both do the
same thing.

**Editing a task:** click its card to open the task detail view, where you
can change status, priority, or assignee, and see/add comments.

**Assigning a task:** set the **Assignee** dropdown inside the task detail
view, or when creating it. The assignee receives an in-app notification
immediately.

**Commenting:** inside the task detail view, type in the comment box and
click **Post**. The task's assignee (if it isn't you) is notified.

**Deleting a task:** open the task and click **Delete task** at the bottom
of the panel; you'll be asked to confirm.

## 5. Notifications

Click the bell icon in the top navigation bar to see your notifications —
you're notified when:

- You're assigned to a task
- A task you're assigned to changes status
- Someone comments on a task you're assigned to

Opening the notification panel marks all notifications as read.

## 6. Priority and due dates at a glance

Each task card shows a thin colored bar on its left edge:

| Color | Priority |
|---|---|
| Rust (red-orange) | High |
| Amber | Medium |
| Moss (green) | Low |

The due date (if set) appears at the bottom of the card in monospace type;
cards without a due date show "No due date."

## 7. Signing out

Click **Sign out** in the top navigation bar. Your session token is
cleared from the browser immediately.

## 8. Accessibility notes

- Every interactive element (buttons, form fields, drag targets) is
  reachable and operable via keyboard alone; task status can be changed
  without drag-and-drop through the Status dropdown in the task modal.
- All form fields have visible, associated labels (not just placeholder
  text), and error messages are announced via `role="alert"`.
- Focus is visibly indicated (a blue outline) on every interactive element
  for keyboard users.
