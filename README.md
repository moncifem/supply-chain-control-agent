# SuppAIChain Control Tower 🗼

*Built for Hackathon RAISE 2025* 🚀

A smart Supply Chain Control Tower powered by AI agents that revolutionizes retail distribution planning through intelligent monitoring and real-time insights.

## 📦 Overview

SuppAIChain Control Tower transforms traditional supply chain monitoring by replacing static dashboards with an intelligent AI agent that acts as a virtual supply chain analyst—available 24/7.

### Context: Retail Distribution Planning
Retail distribution planning involves coordinating all processes to prepare and deliver goods from central warehouses to stores across multiple cities and countries. At each step, systems collect timestamps that enable end-to-end monitoring from order creation to store delivery.

### What is a Control Tower?
A Supply Chain Control Tower is a set of dashboards that utilizes these timestamps to provide end-to-end visibility and real-time monitoring of shipments, enabling teams to detect delays, understand root causes, and take corrective action.

### 🤖 Our AI-Powered Solution
SuppAIChain replaces static dashboards with an intelligent AI agent built for distribution planning operations. The agent connects to a structured shipment database that tracks delivery steps from warehouse to stores, allowing users to ask operational questions through chat, email, or voice for instant insights.

## 🚀 Core Features

- **Natural Language Chat Interface**: Web-based conversational AI for supply chain queries
- **Email Integration**: Automated email input and reply via n8n workflows
- **Voice-to-Query**: Speech recognition with text-to-speech capabilities
- **Structured Reasoning**: Multi-step delay tracing using Smolagents
- **Database Adaptation**: On-boarding feature helping users describe their database schema to the agent
- **Code Generation**: AI agent capable of creating data visualizations on the fly

## 🎯 Value Proposition

- Enable business users to monitor performance without dashboards or SQL knowledge
- Scalable solution for enterprises handling high volumes of shipments
- Modernize team interactions with operational data for faster decision-making
- 24/7 availability for continuous supply chain monitoring

## 🏗️ Architecture

The application consists of four main services:

### Frontend Application (Next.js)
- **Port**: 3449
- **Technology**: Node.js 20.15.1
- **Features**: Web interface, authentication, dashboard

### AI Agent Service (Python)
- **Port**: 8088
- **Technology**: Python 3.11 with FastAPI/Uvicorn
- **Features**: AI processing, natural language understanding, data analysis

### Database (MySQL)
- **Port**: 3311
- **Technology**: MySQL with Prisma ORM
- **Features**: Shipment data storage, timestamp tracking

### Cron Service (Node.js)
- **Port**: 3050
- **Technology**: Node.js with Docker integration
- **Features**: Scheduled tasks, automated workflows

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd supply-chain-control-agent
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration values
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Access the services**
- Frontend: http://localhost:3449
- AI Agent API: http://localhost:8088
- Cron Service: http://localhost:3050

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=mysql://root:root@appMysql:3306/appDB
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=appDB

# Authentication
NEXTAUTH_URL=http://localhost:3449
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Discord OAuth (Optional)
AUTH_DISCORD_ID=your-discord-id
AUTH_DISCORD_SECRET=your-discord-secret

# AI APIs
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

## 📁 Project Structure

```
supply-chain-control-agent/
├── frontend/          # Next.js web application
├── agent/            # Python AI agent service
├── crontab/          # Node.js cron service
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Development

### Running in Development Mode

1. **Database First**
```bash
docker-compose up radioMysql -d
```

2. **Frontend Development**
```bash
cd frontend
npm install
npx prisma migrate dev
npm run dev
```

3. **Agent Development**
```bash
cd agent
pip install uv
uv sync
uv run uvicorn main:app --reload
```

### Production Deployment

The Docker Compose configuration is set for production mode with optimized builds and restart policies.

**SuppAIChain Control Tower** - Transforming Supply Chain Operations with