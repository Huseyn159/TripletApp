# ✈️ Triplet - AI-Powered Travel Planner

Triplet is a modern, microservices-based web application that leverages Google Gemini AI to generate personalized day-by-day travel itineraries and manage budgets. Built with a strict focus on security, scalability, and a premium user experience.

## ✨ Key Features
* **🤖 AI Itineraries & Budgeting:** Generates optimized travel plans and financial audits via Gemini AI.
* **🛡️ Advanced Security:** JWT authentication, email verification, secure password recovery, and automatic account locking on multiple failed login attempts.
* **⚙️ Microservices Architecture:** Distributed system routed through Spring Cloud Gateway and managed by Eureka Discovery Server.
* **🐳 Fully Dockerized:** Implements the "Database per service" pattern, easily orchestrated with Docker Compose.
* **🎨 Premium UI:** Responsive, glassmorphism-inspired design built with React and Framer Motion.

## 🛠️ Tech Stack
* **Backend:** Java 17, Spring Boot, Spring Cloud (Gateway, Eureka), Spring Security (JWT)
* **Database:** PostgreSQL
* **AI:** Google Gemini API
* **DevOps:** Docker, Docker Compose
* **Frontend:** React, Tailwind CSS, Lucide React, Framer Motion

## 🚀 How to Run (Local Environment)

1. Clone the repository.
2. Ensure Docker and Docker Compose are installed on your machine.
3. Run the following command in the root directory to start all backend services and databases:
   ```bash
   docker-compose up --build
4.Once the backend is running, navigate to the frontend folder:
   cd frontend
   npm install
   npm run dev








----------------------------------------------------------------------------
SCREENSHOTS:
----------------------------------------------------------------------------
<img width="866" height="460" alt="Screenshot dashboard" src="https://github.com/user-attachments/assets/a3997e2f-186c-4b6e-a3c3-69e57532c5cf" />
<img width="545" height="548" alt="journey details - Copy" src="https://github.com/user-attachments/assets/9c02432a-05b2-4180-b5d2-2a9a308035cd" />
<img width="299" height="473" alt="verify mail - Copy" src="https://github.com/user-attachments/assets/7e70da1e-3f5c-4859-8d6a-19734ae68eb1" />
<img width="697" height="688" alt="trip - Copy" src="https://github.com/user-attachments/assets/2d972f63-ba3a-4e9a-b8ff-64047b77b534" />
<img width="1261" height="689" alt="regsiter screen - Copy" src="https://github.com/user-attachments/assets/46113f2f-25e8-4567-9a5f-24d12ca75af2" />
<img width="1261" height="680" alt="login screen - Copy" src="https://github.com/user-attachments/assets/d9cb9c92-34d4-4705-ab27-b3297b81834e" />
![loading Gif](https://github.com/user-attachments/assets/1642e2b1-8ab4-41bd-8bf0-8967b172eb9c)
