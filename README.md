# Admin Panel Backend

A GraphQL API backend for an admin panel built with TypeScript, TypeORM, and Apollo Server.

## Features

- User authentication with JWT
- User management (CRUD operations)
- Role-based access control
- PostgreSQL database integration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/admin-panel-backend.git
cd admin-panel-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=4004
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=admin_panel
NODE_ENV=development
JWT_SECRET=your_secret_key
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

The GraphQL API is available at `http://localhost:4004/graphql`.

### Example Queries and Mutations

#### Create a User
```graphql
mutation {
  createUser(
    username: "admin"
    email: "admin@example.com"
    password: "admin123"
    firstName: "Admin"
    lastName: "User"
    role: ADMIN
  ) {
    user {
      id
      username
      email
      role
    }
    error
  }
}
```

#### Login
```graphql
mutation {
  login(username: "admin", password: "admin123") {
    token
    user {
      id
      username
      email
      role
    }
    error
  }
}
```

## License

MIT 