# Structure Guard

https://nsf-m4c-one-fr-09.sf-converter.com/prod-new/download/eyJtZWRpYUlkIjoiWEVRY3JoQTZyanMiLCJ0aXRsZSI6IldoYXQgQW5kaHJhIFByYWRlc2gncyAyMDI1IEluZnJhc3RydWN0dXJlIEdyb3d0aCBNZWFucyBmb3IgWW91ciBGVVRVUkUiLCJmb3JtYXQiOiJtcDQiLCJxdWFsaXR5IjoiNzIwIiwidGltZXN0YW1wIjoxNzg1OTQ3MTQ5fQ.ee217c6cf88ca907ca2923162d3baa8c ----landing page video sand================SIMRAS — MASTER FRONTEND & UI DEVELOPMENT PROMPT

You are a Senior Product Designer, Senior UI/UX Designer, Motion Designer, React + TypeScript Architect, and Enterprise Frontend Engineer.

Build the complete frontend for the following product.

1. PRODUCT IDENTITY

Product Name

SIMRAS

Full Name

Structural Infrastructure Monitoring and Risk Assistance System

Brand

SIMRAS

Primary Tagline

Monitor. Predict. Protect.

Product Description

SIMRAS is an intelligent infrastructure monitoring and risk assistance platform designed to help infrastructure authorities, engineers, officers, planners, and decision makers monitor structural infrastructure, understand asset conditions, identify risks, visualize infrastructure spatially, and support data-driven decisions.

SIMRAS combines:

Structural Infrastructure Monitoring

Artificial Intelligence

Machine Learning

Risk Prediction

Infrastructure Analytics

GIS

Digital Twin

Infrastructure Asset Management

Inspection Data

Risk Visualization

Reports

Decision Support

The interface must communicate:

Safety + Intelligence + Infrastructure + Trust + Precision + Modern Technology

This must look like a serious enterprise/government infrastructure platform, not a generic AI SaaS website or student project.

2. FRONTEND DEVELOPMENT GOAL

Build the entire frontend first.

Do NOT implement:

Real backend

Database

Real authentication

Real AI model integration

Real API calls

at this stage.

Use realistic mock data and service abstractions.

The architecture must allow the backend, database, APIs, and AI models to be integrated later without redesigning the frontend.

Future architecture:

SIMRAS FRONTEND
       ↓
     REST API
       ↓
    FastAPI
       ↓
 PostgreSQL + PostGIS
       ↓
 AI/ML Models
       ↓
 Predictions / Analytics / Risk


3. TECHNOLOGY

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

React Router

Motion / Framer Motion

Lucide React

Recharts

Leaflet

CesiumJS-ready architecture

Use TypeScript strictly.

Use reusable components.

Do not create giant components.

4. BRAND DESIGN

The visual identity should be:

Professional

Cinematic

Premium

Technical

Clean

Trustworthy

Modern

Enterprise

Infrastructure-focused

The design should NOT be:

Cartoonish

Gaming-style

Neon-heavy

Excessively futuristic

Generic AI SaaS

Excessively glassmorphic

Full of gradients

Full of unnecessary animations

Use a restrained visual system.

5. COLOR SYSTEM

Create a professional infrastructure-oriented palette.

Primary:

Deep navy / near-black

White

Cool neutral gray

Accent:

Professional blue

Teal/cyan used sparingly

Risk colors:

Green = Healthy

Amber = Warning

Red = Critical

Do not use bright neon colors.

Create CSS variables/design tokens so the colors can easily be changed later.

Example:

--background
--foreground
--primary
--secondary
--accent
--muted
--border
--success
--warning
--danger


6. TYPOGRAPHY

Use a modern professional sans-serif typeface.

Typography hierarchy:

Hero heading
↓
Section heading
↓
Page heading
↓
Subheading
↓
Body
↓
Caption


Use large cinematic typography on the landing page.

Use compact readable typography inside dashboards.

Do not use oversized text everywhere.

7. LOGO / BRAND

Create a clean SIMRAS wordmark.

Primary display:

SIMRAS


Secondary:

Structural Infrastructure Monitoring
and Risk Assistance System


Logo should work in:

Navigation

Landing page

Dashboard sidebar

Login page

Favicon

Use a simple infrastructure-inspired symbol if creating an icon.

Possible visual inspiration:

Structural frame

Bridge geometry

Network

Infrastructure grid

Monitoring signal

Do not create a complicated logo.

8. GLOBAL NAVIGATION

There are two navigation systems.

Public Navigation

Used on the landing page.

SIMRAS

Platform
AI Intelligence
Digital Twin
GIS
Infrastructure
About

Login
[ Get Started ]


Desktop:

┌─────────────────────────────────────────────────────────────┐
│ SIMRAS   Platform   AI Intelligence   Digital Twin   GIS    │
│                                      About  Login [Start]    │
└─────────────────────────────────────────────────────────────┘


The navigation starts transparent over the cinematic hero.

When scrolling:

background becomes solid/semi-transparent

subtle border appears

shadow appears

navigation remains sticky

Mobile:

SIMRAS                         ☰


Open a professional mobile navigation drawer.

9. APPLICATION SIDEBAR

After login, use a professional dashboard layout.

Sidebar:

SIMRAS
Structural Infrastructure
Monitoring System

────────────────────

OVERVIEW
Dashboard

AI INTELLIGENCE
Predictions
Analytics
Risk Analysis
Model Performance

DIGITAL INFRASTRUCTURE
Digital Twin
GIS
Infrastructure Assets

REPORTS
Reports

SYSTEM
Notifications
Profile
Settings

────────────────────

Logout


Use Lucide icons.

The active page must have a strong but subtle active state.

Sidebar should support:

Expanded desktop

Collapsed desktop

Mobile drawer

10. LANDING PAGE

The landing page must be cinematic and smooth.

Sections:

1. Cinematic Hero
2. Platform Introduction
3. Infrastructure Intelligence
4. AI Risk Prediction
5. Digital Twin
6. GIS Intelligence
7. How SIMRAS Works
8. Infrastructure Capabilities
9. Infrastructure Monitoring
10. Impact / Benefits
11. Final Cinematic CTA
12. Footer


The page should feel like one continuous visual story.

11. CINEMATIC HERO

Create a full-screen cinematic hero.

Use the provided video as the hero background.

Hero:

────────────────────────────────────────────

                    SIMRAS

       STRUCTURAL INFRASTRUCTURE
          MONITORING & INTELLIGENCE

             MONITOR. PREDICT. PROTECT.

 AI-powered infrastructure monitoring and
 risk assistance for smarter decisions.

       [ Explore SIMRAS ]
       [ View Digital Twin ]

                         ↓ Scroll
────────────────────────────────────────────


Requirements:

100vh

Full-width video

Autoplay

Muted

Loop

PlaysInline

Smooth poster/loading state

Cinematic dark overlay

Excellent text contrast

No video controls

Hero animation:

Navigation fades in

SIMRAS appears

Main heading appears

Description appears

Buttons appear

Scroll indicator appears

Use subtle motion.

No excessive particles.

No bouncing.

No flashing.

12. PLATFORM INTRODUCTION

Heading:

Infrastructure Intelligence, Built for Better Decisions.

Explain SIMRAS in a concise professional way.

Show four core pillars:

01
MONITOR

Understand infrastructure
conditions continuously.

02
ANALYZE

Turn infrastructure data
into meaningful insights.

03
PREDICT

Identify potential risks
before they escalate.

04
ASSIST

Support informed
infrastructure decisions.


Use supplied visual media in the composition.

13. AI INTELLIGENCE SECTION

Heading:

Predict Risk Before It Becomes a Problem.

Show a sophisticated AI visualization.

Demo dashboard:

AI INTELLIGENCE

Model Performance
R² 0.966

Predictions
25

High Risk Assets
08

Reports Generated
12


Include:

Prediction trend chart

Risk distribution

Model performance

AI insights

Asset health

Example insight:

AI Insight

Bridge BR-104 shows increasing
structural risk indicators.

Risk Level
HIGH

Confidence
94.2%


Use mock data only.

Structure it so values can later come from APIs.

14. DIGITAL TWIN SECTION

Heading:

See Infrastructure as a Living System.

Create a large immersive visual section.

Show:

3D infrastructure

Buildings

Bridges

Roads

Infrastructure assets

Asset health

Risk indicators

Digital representation

Create a visual preview of the future Digital Twin interface.

CTA:

Explore Digital Twin →


Architecture must be ready for CesiumJS integration.

15. GIS SECTION

Heading:

Understand Infrastructure in Its Real-World Context.

Create a premium GIS preview.

Display:

Map

Infrastructure markers

Roads

Bridges

Buildings

Risk zones

Asset health

Map layers

Map controls:

Search
Zoom +
Zoom -
Layers
Legend
Locate


Legend:

● Healthy
● Warning
● Critical


Use Leaflet architecture.

Prepare it for future PostGIS integration.

16. HOW SIMRAS WORKS

Create a horizontal cinematic process on desktop.

01
COLLECT

Infrastructure data

        ↓

02
UNDERSTAND

AI + GIS analysis

        ↓

03
PREDICT

Risk and future conditions

        ↓

04
ASSIST

Data-driven decisions


On mobile convert to a vertical timeline.

Use scroll-triggered animations.

17. CORE CAPABILITIES

Create a premium grid.

Capabilities:

AI Risk Prediction
Infrastructure Monitoring
Structural Analytics
Digital Twin
GIS Intelligence
Asset Management
Risk Assessment
Automated Reports
Decision Support


Each card:

Icon

Title

Short description

Hover state

Use subtle motion.

18. INFRASTRUCTURE MONITORING

Create a strong section showing infrastructure categories.

Categories:

Roads
Bridges
Buildings
Water Infrastructure
Utilities
Other Structures


Show demo monitoring statistics:

Total Infrastructure Assets
1,284

Healthy
934

Warning
276

Critical
74


These are demonstration values.

Do not claim they represent real-world data.

19. IMPACT SECTION

Heading:

From Infrastructure Data to Intelligent Action.

Show:

01
Earlier Risk Identification

02
Better Infrastructure Visibility

03
Centralized Asset Intelligence

04
Data-Driven Decision Support


Use visual storytelling rather than generic marketing claims.

20. FINAL CINEMATIC CTA

Use a supplied cinematic visual.

Heading:

Build Safer Infrastructure Through Intelligence.

Supporting text:

SIMRAS connects monitoring, AI, GIS and digital twin technologies into one intelligent infrastructure platform.

Buttons:

[ Explore SIMRAS ]
[ Request Access ]


Make this section visually powerful.

21. FOOTER

Footer:

SIMRAS

Structural Infrastructure Monitoring
and Risk Assistance System


Columns:

PLATFORM

AI Intelligence

Digital Twin

GIS

Infrastructure

Analytics

RESOURCES

Reports

Documentation

Technology

COMPANY

About

Contact

LEGAL

Privacy

Terms

Bottom:

© 2026 SIMRAS. All rights reserved.


22. AUTHENTICATION

Create professional authentication screens.

Login

Welcome back to SIMRAS

Access your infrastructure intelligence platform.

Email
[____________________]

Password
[____________________]

[ Sign In ]

──────── OR ────────

[ Continue with Email OTP ]
[ Continue with Phone OTP ]

Forgot password?

Don't have an account?
Create account


Register

Create your SIMRAS account

Full Name
Email
Phone Number
Password
Confirm Password

[ Create Account ]


OTP

Create:

Email OTP

Phone OTP

Resend OTP

Countdown

Change email/phone

Forgot Password

Create a professional password recovery flow.

23. MAIN DASHBOARD

After authentication, show the SIMRAS overview dashboard.

Header:

Good morning, [User]

Infrastructure Overview

Last updated: Today


Top cards:

Total Assets
1,284

Healthy
934

At Risk
350

AI Predictions
25


Main dashboard:

Infrastructure Health
[ Chart ]

Risk Overview
[ Chart ]

AI Insights
[ Insight Cards ]

Recent Activity
[ Activity List ]


Quick actions:

View Infrastructure
Open GIS
Open Digital Twin
View Predictions
Generate Report


24. AI INTELLIGENCE MODULE

Route:

/ai


Page:

AI Intelligence

Tabs:

Overview
Predictions
Risk Analysis
Analytics
Model Performance


Overview:

Model R²

Predictions

Risk assets

Confidence

AI insights

Prediction page:

Prediction Overview

Asset
Prediction
Risk
Confidence
Prediction Date


Risk Analysis:

Risk distribution

High-risk assets

Medium-risk assets

Low-risk assets

Risk trends

Model Performance:

R²

MAE

RMSE

Model version

Training date

Evaluation chart

25. ANALYTICS MODULE

Create a professional analytics interface.

Filters:

Date
Region
Infrastructure Type
Risk Level
Asset Status


Charts:

Infrastructure health trend

Risk trend

Asset distribution

Prediction trend

Infrastructure condition

Regional analysis

Provide:

Export
Generate Report


buttons.

26. DIGITAL TWIN MODULE

Route:

/digital-twin


Create an immersive application.

Top controls:

2D GIS | 3D Twin

Search Asset

Layers

View

Settings


Main area:

┌──────────────────────────────────────────┐
│                                          │
│           DIGITAL TWIN VIEW              │
│                                          │
│        Infrastructure Model              │
│                                          │
└──────────────────────────────────────────┘


Right panel:

Selected Asset

Bridge BR-104

Health
Good

Risk
Low

Last Inspection
08 Aug 2026

AI Prediction
Low Risk


Create architecture ready for CesiumJS.

27. GIS MODULE

Route:

/gis


Create a full-screen GIS workspace.

Layout:

┌─────────────────────────────────────────────┐
│ Search infrastructure...          Filters  │
├───────────────────────────┬─────────────────┤
│                           │                 │
│                           │ Asset Details   │
│          GIS MAP          │                 │
│                           │                 │
│                           │                 │
├───────────────────────────┴─────────────────┤
│ Layers | Legend | Map Controls              │
└─────────────────────────────────────────────┘


Prepare for:

Leaflet

PostGIS

GeoJSON

Asset coordinates

Risk layers

Infrastructure layers

28. INFRASTRUCTURE ASSETS MODULE

Route:

/infrastructure


Page:

Infrastructure Assets

Filters:

Search

Asset type

Location

Health

Risk

Status

Table:

Asset ID
Asset Name
Type
Location
Health
Risk
Last Inspection
Status


Asset details route:

/infrastructure/:id


Details:

Overview

Location

Health

Risk

AI Prediction

Inspection History

Analytics

Digital Twin

29. REPORTS MODULE

Route:

/reports


Report categories:

AI Prediction Reports
Infrastructure Reports
Risk Reports
Analytics Reports
Inspection Reports


Report card:

Infrastructure Risk Assessment

Type
AI Analysis

Generated
09 Aug 2026

Status
Ready

[ View ]
[ Download ]


Create report viewer interface.

30. NOTIFICATIONS

Route:

/notifications


Show:

AI Risk Alert
Bridge BR-104 risk level increased.

Inspection Reminder
Inspection due for Road RD-204.

System Update
New analytics data available.


Use severity states.

31. PROFILE

Route:

/profile


Show:

Profile photo

Full name

Email

Phone

Organization

Role

Actions:

Edit Profile
Change Password
Security


32. SETTINGS

Route:

/settings


Sections:

Account
Security
Notifications
Appearance


Include:

Theme

Notification preferences

Password

Session management

33. ROUTING STRUCTURE

Implement:

/
├── LandingPage

/auth
├── login
├── register
├── verify-email
├── verify-phone
├── forgot-password
└── reset-password

/dashboard

/ai
├── predictions
├── analytics
├── risk-analysis
└── model-performance

/digital-twin

/gis

/infrastructure
└── :id
    └── history

/reports
└── :id

/notifications

/profile

/settings


Use:

PublicRoute
ProtectedRoute


34. COMPLETE PROJECT STRUCTURE

Create the project exactly with a scalable structure:

SIMRAS/
│
├── public/
│   ├── favicon.svg
│   └── logo.svg
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── videos/
│   │   ├── icons/
│   │   └── logos/
│   │
│   ├── components/
│   │   │
│   │   ├── common/
│   │   ├── navigation/
│   │   ├── landing/
│   │   ├── dashboard/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── digital-twin/
│   │   ├── gis/
│   │   ├── infrastructure/
│   │   ├── reports/
│   │   └── profile/
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── EmailOTPPage.tsx
│   │   │   ├── PhoneOTPPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── AIIntelligencePage.tsx
│   │   │   ├── PredictionsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── RiskAnalysisPage.tsx
│   │   │   └── ModelPerformancePage.tsx
│   │   │
│   │   ├── digital-twin/
│   │   │   └── DigitalTwinPage.tsx
│   │   │
│   │   ├── gis/
│   │   │   └── GISPage.tsx
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── InfrastructurePage.tsx
│   │   │   ├── AssetDetailsPage.tsx
│   │   │   └── AssetHistoryPage.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx
│   │   │   └── ReportDetailsPage.tsx
│   │   │
│   │   ├── notifications/
│   │   │   └── NotificationsPage.tsx
│   │   │
│   │   └── settings/
│   │       ├── ProfilePage.tsx
│   │       └── SettingsPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── infrastructureService.ts
│   │   ├── predictionService.ts
│   │   ├── analyticsService.ts
│   │   ├── gisService.ts
│   │   └── reportService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAssets.ts
│   │   ├── usePredictions.ts
│   │   ├── useAnalytics.ts
│   │   └── useMap.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── dashboardStore.ts
│   │   └── mapStore.ts
│   │
│   ├── data/
│   │   ├── landingData.ts
│   │   ├── dashboardData.ts
│   │   ├── infrastructureData.ts
│   │   ├── predictionData.ts
│   │   ├── analyticsData.ts
│   │   └── reportData.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── infrastructure.ts
│   │   ├── prediction.ts
│   │   ├── analytics.ts
│   │   ├── gis.ts
│   │   └── reports.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json
├── .env.example
├── .gitignore
└── README.md


35. REUSABLE COMPONENTS

Create reusable components including:

Button
Card
StatCard
StatusBadge
RiskBadge
DataTable
SearchBar
FilterBar
PageHeader
ChartCard
Modal
Drawer
Tabs
Tooltip
Dropdown
Pagination
LoadingState
EmptyState
ErrorState
MapPanel
AssetCard
AIInsightCard
ReportCard


36. MOCK DATA

Use realistic demonstration data.

Example infrastructure:

BR-104
Rajiv Bridge
Bridge
Healthy
Low Risk


RD-204
Central Road
Road
Warning
Medium Risk


BL-302
Municipal Building
Building
Critical
High Risk


Do not use real sensitive infrastructure information.

37. RESPONSIVE DESIGN

Support:

1440+
1280
1024
768
480
375


Desktop:

Full sidebar

Multi-column dashboards

Large charts

Large GIS workspace

Tablet:

Collapsible sidebar

Responsive charts

Adaptive layouts

Mobile:

Mobile drawer

Single-column layouts

Horizontal scrolling for appropriate data

Touch-friendly controls

Optimized charts

Simplified map controls

Do not merely scale down desktop.

Design mobile intentionally.

38. MOTION SYSTEM

Use Motion / Framer Motion.

Landing page:

Cinematic fade

Section reveal

Scroll transitions

Image movement

Video transitions

Card hover

Navigation transitions

Dashboard:

Page transitions

Card entrance

Chart animation

Modal transitions

Motion must be subtle and professional.

Respect:

prefers-reduced-motion


39. PERFORMANCE

Implement:

Lazy loading

Code splitting

Lazy routes

Optimized images

Lazy video loading

Responsive media

Minimal unnecessary JavaScript

GPU-friendly transforms

Avoid layout shifts

Do not allow cinematic effects to destroy performance.

40. ACCESSIBILITY

Follow professional accessibility practices.

Include:

Semantic HTML

Keyboard navigation

Focus states

Accessible buttons

Proper labels

Alt text

ARIA where required

Sufficient contrast

Reduced motion support

41. BACKEND-READY ARCHITECTURE

Initially:

React
 ↓
Mock Service
 ↓
Mock Data


Later:

React
 ↓
Axios
 ↓
FastAPI
 ↓
PostgreSQL
 ↓
PostGIS
 ↓
AI Models


Do not directly put mock data inside UI components.

Use:

data/
services/
types/


properly.

42. QUALITY REQUIREMENT

The final result must look like a real product called:

SIMRAS

Structural Infrastructure Monitoring and Risk Assistance System

The first impression must communicate:

STRUCTURE

MONITORING

RISK INTELLIGENCE

AI

GIS

DIGITAL TWIN

The landing page should feel cinematic.

The application should feel operational.

The dashboard should feel analytical.

The GIS should feel professional.

The Digital Twin should feel advanced.

The entire system should feel like one unified enterprise platform.

Do not create disconnected pages.

Do not use placeholder lorem ipsum.

Do not use generic AI marketing language.

Use meaningful infrastructure terminology throughout the interface.

Build the frontend systematically, cleanly, responsively, and with production-quality component architecture.

The frontend must be ready for the next development stage:

FastAPI + PostgreSQL + PostGIS + Authentication + AI/ML Models + REST APIs. -------

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dfda791f-af28-40f0-9be8-9a5de6fc0975).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
