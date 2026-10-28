# TLC Massage Wellness

A calm, mobile-first website with practical controls for the owner of a massage and wellness practice.

[View the repository](https://github.com/taylordrew4u2/tlcmassagewellness)

## Project overview

TLC Massage Wellness combines a public website with a password-protected admin. The public experience introduces the practice, presents treatments and practitioner profiles, and lets visitors request a preferred appointment. The admin gives the owner control over requests, website content, treatments, photos and optional intake questions.

The project supports both a solo practitioner and a team. The owner can switch between those modes without deleting the stored team profiles.

## The design problem

A wellness website needs to make it easy to understand the offer and take the next step. It also needs to remain useful after launch, when a treatment changes, a photo needs replacing or an appointment request arrives.

This project addresses both needs in one application: a calm presentation for visitors and a direct editing workflow for the owner.

## Visual direction

The identity draws on forest green (`#2f3b2a`), antique gold (`#a89240`) and warm cream (`#f7f3e8`). Cormorant Garamond gives headings an expressive serif voice, while Jost keeps supporting text and controls clear. The butterfly mark connects the public pages and admin.

The public layout is designed for phones first. A single scrolling page moves through the introduction, treatments, practitioner profiles, appointment request form and contact details. A separate booking page provides a shareable destination and can open with a treatment already selected.

## Visitor experience

Visitors can explore the treatment list, read about the practitioner or team, and choose a preferred date and appointment time. The request form collects contact details, treatment preferences, notes and any custom intake questions the owner has enabled.

Submitting the form creates a request awaiting an answer. The appointment is confirmed through the owner's review process; submitting the form does not reserve a guaranteed calendar slot.

## Owner experience

The admin organizes routine work into bookings, treatments, team, intake and website settings. The owner can:

- Accept or decline appointment requests, mark accepted visits completed, reopen requests, filter their status and add private notes.
- Open a prepared response in the normal mail app.
- Add, reorder, hide or remove treatments and practitioner profiles.
- Switch between solo and team presentation.
- Configure short answer, long answer and yes/no intake questions.
- Edit public copy, contact information, appointment times and image links.
- Upload photos when Vercel Blob storage is configured.
- Use the built-in guide to work through setup section by section.

## Technical approach

The application uses Next.js 16.2.11, React 19.2.4, TypeScript and Tailwind CSS 4. It uses the Next.js App Router and Server Actions for the public and admin workflows.

Postgres supplies persistent storage when configured. An in-memory fallback allows local exploration without a database, with the tradeoff that changes are lost when the process restarts. Photo uploads use Vercel Blob; image URL fields remain available when upload storage is absent.

Website content is defined centrally and exposed in the admin editor. That structure connects the public interface to the owner's editing controls and provides a repeatable way to add editable fields.

## What the project demonstrates

The implementation demonstrates a complete path from a public treatment page to an owner-reviewed appointment request, alongside content editing and profile management. Its portfolio value lies in connecting the visual system to everyday tasks: helping a visitor find a treatment and helping the owner maintain the website and respond to requests.

No traffic, conversion, revenue, usability study or customer outcome data was supplied for this case study. The description reports the implemented experience and code capabilities.

## Current boundaries

The project does not include online payment checkout, automatic email delivery or a synchronized booking calendar. Email replies open in the owner's mail application. A production deployment needs configured storage and real business content in place of sample defaults.

## Portfolio card copy

**Title:** TLC Massage Wellness

**Description:** A mobile-first wellness website with treatment discovery, appointment requests and a password-protected admin for content, profiles and practice updates.

**Tags:** Next.js · React · TypeScript · Tailwind CSS · Postgres · Vercel Blob

**CTA:** View project

## Suggested image sequence

1. **Cover:** A large public website preview and a phone preview, framed by the project's green, gold and cream palette.
2. **Public experience:** Homepage and treatment detail views with short captions.
3. **Request flow:** The appointment request form, with the caption “Visitors send a preferred date, time and treatment for owner review.”
4. **Owner controls:** Admin views showing appointment review, content editing and practitioner management.
5. **Design detail:** Palette, typography and butterfly motif.

Use real interface captures for capability evidence. Label styled compositions as mockups where their presentation could be mistaken for the deployed interface. Keep default contact information and sample personal data out of portfolio screenshots.

## Source basis

Reviewed repository state: [`ec8b6f349a42479765246369fae3d3919e71c287`](https://github.com/taylordrew4u2/tlcmassagewellness/tree/ec8b6f349a42479765246369fae3d3919e71c287).

- [README: workflow, setup and design](https://github.com/taylordrew4u2/tlcmassagewellness/blob/ec8b6f349a42479765246369fae3d3919e71c287/README.md)
- [Package versions](https://github.com/taylordrew4u2/tlcmassagewellness/blob/ec8b6f349a42479765246369fae3d3919e71c287/package.json)
- [Public page](https://github.com/taylordrew4u2/tlcmassagewellness/blob/ec8b6f349a42479765246369fae3d3919e71c287/app/page.tsx)
- [Editable content definitions](https://github.com/taylordrew4u2/tlcmassagewellness/blob/ec8b6f349a42479765246369fae3d3919e71c287/app/lib/content.ts)
- [Booking and admin actions](https://github.com/taylordrew4u2/tlcmassagewellness/blob/ec8b6f349a42479765246369fae3d3919e71c287/app/actions.ts)

This case study describes the project in third person. Add personal role, responsibilities, collaborators and project dates only after those details are verified.
