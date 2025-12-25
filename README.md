# JobCluster
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B3C5D,100:1F6AE1&height=180&section=header&text=JobCluster&fontSize=56&fontAlignY=35&animation=fadeIn&fontColor=ffffff"/>

### AI-Powered Job Discovery & Resume Intelligence Platform

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&duration=2800&pause=1000&color=1F6AE1&center=true&vCenter=true&width=680&lines=AI-Powered+Job+Discovery+Platform;ATS+Resume+Analysis+Engine;Service-Oriented+Backend;Docker-Ready+and+Scalable" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
</p>

</div>

---

## 💔 Why JobCluster?

- Resumes disappear into **ATS black holes**
- Job hunting feels like **searching in the dark**
- Candidates apply blindly without feedback
- Recruiters filter resumes without transparency  

**You deserve clarity, insight, and control.**

---

## 🌟 What is JobCluster?

**JobCluster** is a production-ready, AI-assisted job discovery and resume analysis platform designed to help candidates understand **how hiring systems see them**.

It combines **real-time job aggregation** with **ATS-based resume scoring**, giving users actionable insights to improve their chances before applying.

Built with a **modular, service-oriented backend**, JobCluster focuses on:
- Maintainability
- Scalability
- Security
- Real-world hiring workflows


---

## ✨ Key Features

- 📄 **ATS Resume Analysis** – Structured resume scoring with improvement insights  
- 🌍 **Real-Time Job Aggregation** – Live jobs via Jooble API  
- ⚙️ **Background Processing** – Celery-powered async resume parsing  
- 🔐 **Secure Authentication** – Google OAuth + JWT  
- 🧱 **Scalable Architecture** – Redis caching & message queues  

---

## 🏗️ System Architecture

JobCluster follows a **modular, service-oriented architecture**:

- **Auth Server** – Google OAuth & JWT issuance  
- **Main API Server** – Jobs, dashboard, saved jobs  
- **Resume Server** – ATS analysis & history  
- **Redis** – Caching & sessions  
- **RabbitMQ** – Message broker  
- **Celery Workers** – Python resume processing  

Each service scales independently.

---

## 🧰 Tech Stack

| Category | Technologies |
|---------|--------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Resume Engine | Python |
| Database | MongoDB |
| Cache | Redis |
| Messaging | RabbitMQ |
| Background Jobs | Celery |
| Auth | Google OAuth, JWT |
| DevOps | Docker, Docker Compose |
| APIs | Jooble Job Search API |

---

## 🔐 Security Practices

- Secrets stored in `.env` files
- `.env` ignored via `.gitignore`
- OAuth 2.0 authentication
- JWT authorization
- No secrets committed  
✅ Safe for public GitHub repositories

---

## ⚙️ Installation & Usage Guide

Set up **JobCluster** locally in minutes.  
Choose **Docker (recommended)** or **Manual installation**.

---

### 🧩 Step 1: Clone the Repository


Git clone https://github.com/Manju10092006/JobCluster.git
cd JobCluster


## 🧩 Step 2: Install Dependencies

Choose one of the following options based on your setup:

### 🐳 Option A: Docker (Recommended)

Build the Docker image:

```bash
docker build -t jobcluster .
````

---

### 📦 Option B: npm (Node Services)

Install dependencies for all Node.js services:

```bash
npm install
npm install --prefix server
npm install --prefix auth-server
npm install --prefix resume-server
```

---

### 🐍 Option C: pip (Python Worker)

Install Python dependencies for resume processing:

```bash
pip install -r server/python-worker/python-worker/requirements.txt
```

---

## ▶️ Step 3: Run the Project

### 🚀 Using Docker Compose (Best & Easiest)

```bash
docker-compose up -d
```

This will start:

* Auth Server (OAuth)
* Main API Server
* Resume Server
* Redis
* RabbitMQ
* Celery Workers

---

### ▶️ Using npm (Manual)

Start all services:

```bash
npm start
```

Or run them individually:

```bash
npm start --prefix auth-server
npm start --prefix server
npm start --prefix resume-server
```

---

### ▶️ Python Worker Only

```bash
python server/python-worker/python-worker/app.py
```

---

## 🧪 Testing

Run tests using:

```bash
npm test
pytest
```

---

## 📂 Project Structure

```
JobCluster/
├── server/
├── auth-server/
├── resume-server/
├── client/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🚀 Future Enhancements

* 🤖 ML-based job recommendations
* ☁️ Cloud deployment guides
* 🔔 Real-time notifications

---


<div align="center">

## 👨‍💻 Creators

**Built by [Manjunath](https://github.com/yourusername) & [Snehith](https://github.com/snehithusername)**

<p>
  <a href="https://www.linkedin.com/in/s-manjunath-reddy-51784638a/">
    <img src="https://img.shields.io/badge/Manjunath-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
  </a>
  <a href="https://www.linkedin.com/in/snehithb2/">
    <img src="https://img.shields.io/badge/Snehith-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
  </a>
</p>

<p>
  <a href="https://github.com/Manju10092006">
    <img src="https://img.shields.io/badge/Manjunath-GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
  </a>
  <a href="https://github.com/Snehith-0607">
    <img src="https://img.shields.io/badge/Snehith-GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
  </a>
</p>

*Open to opportunities* 💼

---

⭐ **Star this repo if it helps you land your dream job!**  
Made with ❤️ for job seekers worldwide

</div>