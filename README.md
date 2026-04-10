<div align="center">

# 🏫 Smart Campus Operations Hub

**A comprehensive, production-grade management system designed to streamline campus facilities, streamline bookings, track maintenance requests, and deliver real-time notifications.**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

</div>

<br>

## ✨ Key Features & Architecture

The Smart Campus Operations Hub is built on a split-stack architecture, utilizing a robust **Java Spring Boot API** alongside a modern, responsive **React Glassmorphism UI**.

### 🔐 Authentication & Control
- **OAuth Integration**: Secure Google Sign-in to remove password friction and guarantee identity.
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard `USER`s and system `ADMIN`s. Administrators have access to powerful centralized dashboards.

### 🏛️ Resource Catalog & Booking
- **Facility Discovery**: Users can browse, filter, and discover available campus resources (Labs, Meeting Rooms, Equipment).
- **Time-Aware Bookings**: Intelligent conflict detection algorithm prevents double-booking resources for overlapping time slots.
- **Workflow State Machine**: Admin review process allowing Bookings to move smoothly from `PENDING` to `APPROVED` or `REJECTED` (with forced rationale).

### 🛠️ Helpdesk & Maintenance Ticketing
- **Issue Reporting**: Campus members can open support tickets and categorize them by infrastructure/IT, assigning a specific `Priority`.
- **Comment Threads**: Built-in bidirectional commenting allows administrators and users to communicate directly on specific tickets.

### 🔔 Real-Time Notifications
- **System Alerts**: Automatically triggers alerts and unread-badges for users when their bookings are processed or their tickets are resolved.

<br>

## 👥 Team & Responsibilities

This project was developed collaboratively, divided into 5 distinct application domains:

| Member / Module | Core Contribution |
| :--- | :--- |
| 🧑‍💻 **Member 1** <br>*(Facilities)* | Engineered the **Resource Management Domain**. Developed the Admin CRUD interfaces allowing creation, modification, and tracking of campus assets via dynamic tile display. |
| 🧑‍💻 **Member 2** <br>*(Booking Engine)* | Architected the **Reservation System**. Integrated date/time logic, built the backend collision detector, and created the "My Bookings" user interface. |
| 🧑‍💻 **Member 3** <br>*(Maintenance Ticks)*| Constructed the **Ticketing Lifecycle**. Handled state transitions, priority enums, and built the embedded comment synchronization system. |
| 🧑‍💻 **Member 4** <br>*(Notifications)* | Created the **Event Broadcaster**. Developed the global notification overlay, read/unread tracking metrics, and alert repository. |
| 🧑‍💻 **Member 5** <br>*(Auth & Core)* | Built the **Security Foundation**. Handled OAuth token interception, global exception handling, routing guardrails, and overarching UI logic. |

<br>

## 🚀 Getting Started

### 1. Prerequisites
Before attempting to run the project, ensure you have the following installed:
* **Java 17 JDK** or higher
* **Node.js 18.x** or higher (with NPM)
* **MongoDB** (Running locally on the default port `27017`)

### 2. Launch

If you prefer to start the servers independently:

**Terminal 1 (Backend API):**
```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 (React Frontend):**
```bash
cd frontend
npm install
npm start
```

<br>

## 🎨 UI/UX Design System

The platform has been custom-styled without heavy reliance on CSS frameworks, demonstrating core frontend proficiency. We adopted a **"Light Glassmorphism"** theme:
* **Typography:** `Inter` font family for absolute clarity.
* **Palette:** Deep Purple (`#8458B1`), Sky Blue (`#A0D3B8`), and Lavender (`#E5EAF5`) backgrounds to emit an airy, modern feel.
* **Componentry:** Fully responsive collapsible sidebars, floating modal overlays, state-colored badge identifiers, and simulated glass overlays featuring CSS backdrop-filters.

<br>
<div align="center">
  <i>Developed for University Project Submission.</i>
</div>
