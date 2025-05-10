# Testai Project

## Project Overview

This EdTech web app allows tutors to create tests, assignments, or courses and share them with learners. The system uses Google Gemini AI to analyze documents and auto-generate questions. Learners use a code to access and complete assessments. Tutors can manage tests, view results, and receive notifications.

## Core Features

Tutor Interface

Tutor registration, login, logout.

Create and manage courses, assignments, or tests.

Upload text, DOC, PDF, and image files for analysis.

Input instructions: number of questions, question type, difficulty, etc.

AI-generated questions based on uploaded content and inputs.

Set exam settings: pass mark, result text, shuffle answers.

View exam stats: submissions, scores, pass rate, student responses.

Shareable links and codes for learner access.

Pause or delete exams.

Learner Interface

Input share code to access test.

Complete assignment in multiple formats:

Multiple choice

True/false

Short answer

Select options

Fill in the gap

Media upload (audio, image)

See results based on tutor settings.

## Chosen Tech Stack

Frontend

Framework: React.js with TypeScript

Styling: Tailwind CSS

State Management: Zustand

Routing: React Router DOM

Form Handling: React Hook Form + Zod

Charts/Analytics: Recharts

UI Components: shadcn/ui

Backend

Framework: Node.js with Express.js

Database: Supabase (PostgreSQL + Authentication + File Storage)

AI Integration: Google Gemini API

Authentication: Supabase Auth (email/password + OTP)

Notifications: Email via Supabase Edge Functions

AI Integration

Use Google Gemini Pro via REST API to:

Analyze text, DOC, PDF, and image files

Generate questions from content + tutor instruction

## Data Models (PostgreSQL via Supabase)

Users (Tutors)

id (UUID)
name (text)
email (text, unique)
password (hashed)
created_at (timestamp)

Tests/Assignments

id (UUID)
tutor_id (UUID)
title (text)
description (text)
type (enum: 'test', 'assignment')
status (enum: 'active', 'paused', 'deleted')
pass_mark (integer)
shuffle_answers (boolean)
result_text (text)
created_at (timestamp)

Uploads

id (UUID)
test_id (UUID)
file_url (text)
file_type (text: 'text', 'doc', 'pdf', 'image')
gemini_analysis_result (jsonb)
created_at (timestamp)

Questions

id (UUID)
test_id (UUID)
type (enum: 'mcq', 'true_false', 'short', 'select', 'fill_gap', 'media')
content (text)
options (jsonb)
answer (text/jsonb)
difficulty (text)
created_at (timestamp)

Learner Submissions

id (UUID)
test_id (UUID)
learner_id (UUID or text)
answers (jsonb)
score (int)
passed (boolean)
submitted_at (timestamp)

## REST API Endpoints

Auth

POST /api/auth/signup

Secure sign-up with hashed password.

Validates password strength.

Enforces rule: password must not contain user's name.

Clear error messages for weak passwords or name-based passwords.

POST /api/auth/login

Secure login with error handling.

Validates credentials and returns user token.

Error messages shown on incorrect email or password.

POST /api/auth/logout

Logs out user and clears session/token.

Tests

POST /api/tests – create test/assignment

GET /api/tests/:id – get test details

PATCH /api/tests/:id – update test

DELETE /api/tests/:id – delete test

PATCH /api/tests/:id/pause – pause test

Upload & AI Analysis

POST /api/upload – upload file (doc, pdf, text, image)

POST /api/ai/analyze – send content + tutor instruction to Gemini and get questions

Questions

GET /api/tests/:id/questions – list questions for a test

POST /api/questions – add question manually

Learner Flow

POST /api/access-code – validate and fetch test by code

POST /api/submit – submit answers

GET /api/result/:submission_id – show result (based on tutor settings)

Tutor Dashboard

GET /api/tests/:id/stats – view stats: total attempts, pass rate, score breakdown

GET /api/tests/:id/responses – get learner submissions

## File Handling

Use Supabase Storage Buckets

Each uploaded file is stored and the URL is saved in DB.

File is processed based on its type:

Text/DOC/PDF → extract plain text via pdf-parse, mammoth, or docx parser

Image → OCR via Google Gemini vision model

## AI Instruction Format (to Gemini API)

{
"content": "Extracted plain text",
"instructions": {
"num_questions": 5,
"question_type": "mcq",
"difficulty": "medium"
}
}

Gemini returns structured questions for insertion into DB.

## Notifications

Tutor receives email when a learner submits an exam

Supabase Edge Functions + SMTP for email

## Hosting & Deployment

Frontend: Vercel

Backend: Render or Railway

Database + Auth + Storage: Supabase

Domain: Cloudflare DNS

## Step-by-Step Development (Backend-First, Scalable Approach)

### Phase 1: Project Setup

Initialize monorepo with frontend/ and backend/ folders

Set up Supabase project (DB, storage, authentication)

Set up environment variables in .env

Plan folder structure and prepare DB schema

### Phase 2: Backend First

Build and test all auth routes (signup, login, logout) with validation:

Password strength (min 8 chars, upper/lower case, number, symbol)

Password must not contain user's name

Return descriptive validation errors

Implement file upload endpoints using Multer or Supabase SDK

Integrate Google Gemini API (text and vision)

Create endpoints for:

Test creation, update, pause, delete

AI analysis and question generation

Submitting answers and returning results

Tutor dashboard (stats, learner responses)

Write unit tests for all endpoints using Jest + Supertest

Use Postman or Thunder Client to test API manually

### Phase 3: Frontend (React)

Set up layouts for Tutor and Learner views using Tailwind CSS grid system

Use accessible UI components from shadcn/ui

Implement auth pages: login and signup

Display validation errors clearly

Error messages for name-based password rejections

Build forms for test creation, file uploads, and settings

Connect frontend to working backend APIs

Build Learner interface to enter code, take tests, and view results

Use Recharts for analytics dashboard

### Phase 4: Testing & Deployment

Run end-to-end tests for core flows

Fix integration issues between frontend and backend

Deploy frontend (Vercel), backend (Railway or Render)

Set up CI/CD workflows if needed

Connect to custom domain and add HTTPS via Cloudflare

## Next Steps

Build frontend wireframes

Create prompt templates for Gemini

Define UI/UX for mobile

Add analytics dashboard with charts (Recharts + Supabase SQL views)

## Design System Notes

### Typography

Use Manrope

Font Family: Manrope (via Google Fonts: https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap). Weights: Regular (400), Medium (500), Bold (700). Font Sizes: Headings 24px, section headings 16px, body text 14px. Font Colors: Primary #1F2A44, Secondary #6B7280, Interactive #06545E.

Colors Primary: #06545E (deep teal, buttons, links). Secondary: #1F2A44 (near-black), #6B7280 (gray), #E5E7EB (light gray), #FFFFFF (white). Background: #FFFFFF. Hover: #E6F0F2 (buttons). Border: #E5E7EB (default), #06545E (focused).

Spacing and Layout Container: Max-width 700px, centered, padding 24px. Spacing: Vertical 24px/16px, horizontal 8px/16px. Element Heights: Inputs 48px, buttons 40px, question containers (border 1px #E5E7EB, padding 16px, rounded 8px).

Buttons Primary: Background #06545E, text #FFFFFF, border #06545E, hover #E6F0F2, padding 8px, rounded 8px. Secondary: Background #FFFFFF, text #06545E, border #E5E7EB, hover #F9FAFB, padding 8px, rounded 8px.

Inputs Text Inputs: Height 48px, padding 12px, border #E5E7EB, rounded 8px, placeholder #6B7280, focus border #06545E. Checkboxes/Toggles: 20px, border #E5E7EB, checked #06545E.

Headings: font-bold, text-2xl or above

Body text: text-base, font-normal

Line height: use Tailwind's leading-relaxed or leading-normal for comfortable reading

Layout

Use consistent spacing with Tailwind’s padding/margin scale (p-4, gap-6, etc.)

Full-width slate-50 (bg-slate-50)

Centered container white container with max-width of 700px that spans full viewport height

Header must have: - White background - Bottom border (border-b border-slate-200) - Logo and profile menu - Fixed position within the 700px container

Content must start with pt-16 to account for fixed header

Fixed header contained within the 700px width

Use grid or flex layouts for responsiveness

Round cards and buttons using rounded-2xl

Apply soft shadows like shadow-md or shadow-lg

### Color Scheme

Soft neutral backgrounds (bg-gray-50, bg-white)

Accent colors for call-to-actions (bg-blue-600, hover:bg-blue-700, text-white)

Use dark text for contrast (text-gray-900)

### Forms

Use clear labels with text-sm and font-medium

Add focus ring and hover states to inputs and buttons

Group form fields using space-y-4 or grid layout

### Buttons

Use Tailwind's btn styles with padding (px-4 py-2), rounded corners (rounded-lg), and interactive states

Primary: bg-blue-600 text-white hover:bg-blue-700

Secondary: bg-gray-100 text-gray-900 hover:bg-gray-200

App Name: Testcraft AI

## Contributing

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines on how to contribute to this project.

## License

[Specify license information]
