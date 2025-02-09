# Painter Timesheet Application

A modern web application for managing painter employee timesheets, breaks, and locations.

## Features

### Phase 1 (Current)
- User Authentication (Admin/Employee)
- Time Clock Functionality
- Basic Reporting
- Essential Admin Tools

## Tech Stack

### Frontend
- Vue.js 3
- Vue Router
- Pinia (State Management)
- Vuetify 3

### Backend
- Express.js
- JWT Authentication
- MySQL Database
- Sequelize ORM

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Git

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
cd painter-timesheet
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

3. Setup Frontend
```bash
cd ../frontend
npm install
npm run serve
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed hosting instructions.

## License

MIT License - See LICENSE file for details
