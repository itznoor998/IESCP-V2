# Influencer Engagement & Sponsorship Coordination Platform (V2)

**Modern Application Development II Project (September 2024)**  
A web platform connecting **Sponsors** and **Influencers** for product and service promotion. This system enables sponsors to create campaigns and influencers to earn through collaborations.

---

## 🔗 Project Overview

This platform simplifies **Influencer Marketing** by allowing:
- **Sponsors** to run advertising campaigns and send ad requests
- **Influencers** to browse, accept, or negotiate those requests
- **Admins** to monitor, flag users, and manage approvals

---

## 🚀 Features

### 👤 Admin
- System-wide access
- Approves new sponsors
- Views statistics (users, campaigns, ad requests)
- Flags inappropriate content/users

### 🏢 Sponsors
- Register and wait for admin approval
- Create, update, and delete campaigns
- Search for influencers by niche or reach
- Send and manage ad requests
- Export campaign data as CSV

### 🌟 Influencers
- Register and create a public profile
- Search public campaigns by niche, category
- Accept/reject/renegotiate ad requests
- Get daily reminders for pending requests

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Flask, SQLite, Celery, Redis |
| Frontend | HTML + Bootstrap + Vue.js (via CDN) |
| Background Tasks | Celery + Redis |
| Authentication | Flask-Security |
| Notifications | Email or Google Chat Webhook |

---

## 🚀 Deployment

- Download the 'code' folder from GitHub
- Create a virtual environment using 'python3 -m venv <env_name>'
- Activate the virtual environment using 'source <env_name>/bin/activate'
- Install all the dependencies using 'pip3 install -r requirements.txt'
- Run the following commands in different terminals :
    - To run the flask app =>      python3 app.py
    - To run the celery worker =>  celery -A app:celery_app worker -l INFO
    - To run the celery beat =>    celery -A app:celery_app beat -l INFO
    - To run the MailHog =>        ~/go/bin/MailHog

---

## Additional Instructions

- Navigate to http://localhost:5000
- The App uses Vue via CDN