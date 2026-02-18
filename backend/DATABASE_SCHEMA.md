# Database Schema

This document outlines the PostgreSQL database schema for the Portfolio E-Commerce Platform.

## Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────┐
│    Users    │          │   Services   │
├─────────────┤          ├──────────────┤
│ id (PK)     │          │ id (PK)      │
│ email       │          │ name_en      │
│ password    │          │ name_sv      │
│ firstName   │          │ desc_en      │
│ lastName    │          │ desc_sv      │
│ role        │          │ price        │
│ createdAt   │          │ currency     │
│ updatedAt   │          │ features_en  │
└─────────────┘          │ features_sv  │
                         │ category     │
      │                  │ imageUrl     │
      │                  │ isActive     │
      │                  │ createdAt    │
      │                  │ updatedAt    │
      │                  └──────────────┘
      │                         │
      │                         │
      ▼                         ▼
┌─────────────┐          ┌──────────────┐
│   Orders    │──┐       │  OrderItems  │
├─────────────┤  │       ├──────────────┤
│ id (PK)     │  └──────▶│ id (PK)      │
│ userId (FK) │          │ orderId (FK) │
│ orderNumber │          │ serviceId(FK)│
│ totalAmount │          │ quantity     │
│ status      │          │ price        │
│ currency    │          │ serviceName  │
│ paymentId   │          │ createdAt    │
│ email       │          │ updatedAt    │
│ firstName   │          └──────────────┘
│ lastName    │
│ address     │
│ city        │
│ postalCode  │
│ country     │
│ createdAt   │
│ updatedAt   │
└─────────────┘

┌──────────────────┐
│  PortfolioItems  │
├──────────────────┤
│ id (PK)          │
│ title_en         │
│ title_sv         │
│ description_en   │
│ description_sv   │
│ category         │
│ techStack        │
│ projectUrl       │
│ imageUrl         │
│ thumbnailUrl     │
│ featured         │
│ order            │
│ isPublished      │
│ completedDate    │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

## Table Definitions

### Users
Stores admin/user accounts for the platform.

| Column      | Type         | Constraints                    | Description                      |
|-------------|--------------|--------------------------------|----------------------------------|
| id          | UUID         | PRIMARY KEY                    | Unique identifier                |
| email       | VARCHAR(255) | UNIQUE, NOT NULL               | User email address               |
| password    | VARCHAR(255) | NOT NULL                       | Hashed password (bcrypt)         |
| firstName   | VARCHAR(100) | NOT NULL                       | User's first name                |
| lastName    | VARCHAR(100) | NOT NULL                       | User's last name                 |
| role        | ENUM         | NOT NULL, DEFAULT 'user'       | 'admin' or 'user'                |
| createdAt   | TIMESTAMP    | NOT NULL                       | Record creation timestamp        |
| updatedAt   | TIMESTAMP    | NOT NULL                       | Record update timestamp          |

### Services
Stores service offerings available for purchase.

| Column      | Type         | Constraints                    | Description                      |
|-------------|--------------|--------------------------------|----------------------------------|
| id          | UUID         | PRIMARY KEY                    | Unique identifier                |
| name_en     | VARCHAR(255) | NOT NULL                       | Service name (English)           |
| name_sv     | VARCHAR(255) | NOT NULL                       | Service name (Swedish)           |
| desc_en     | TEXT         | NOT NULL                       | Full description (English)       |
| desc_sv     | TEXT         | NOT NULL                       | Full description (Swedish)       |
| price       | DECIMAL(10,2)| NOT NULL                       | Service price                    |
| currency    | VARCHAR(3)   | NOT NULL, DEFAULT 'SEK'        | Currency code (SEK/USD/EUR)      |
| features_en | JSON         | NULL                           | Feature list (English)           |
| features_sv | JSON         | NULL                           | Feature list (Swedish)           |
| category    | VARCHAR(100) | NOT NULL                       | Service category                 |
| imageUrl    | VARCHAR(500) | NULL                           | Service image URL                |
| isActive    | BOOLEAN      | NOT NULL, DEFAULT true         | Service availability status      |
| createdAt   | TIMESTAMP    | NOT NULL                       | Record creation timestamp        |
| updatedAt   | TIMESTAMP    | NOT NULL                       | Record update timestamp          |

### Orders
Stores customer order information.

| Column      | Type         | Constraints                    | Description                      |
|-------------|--------------|--------------------------------|----------------------------------|
| id          | UUID         | PRIMARY KEY                    | Unique identifier                |
| userId      | UUID         | FOREIGN KEY → Users.id, NULL   | User ID (if registered)          |
| orderNumber | VARCHAR(50)  | UNIQUE, NOT NULL               | Human-readable order number      |
| totalAmount | DECIMAL(10,2)| NOT NULL                       | Total order amount               |
| status      | ENUM         | NOT NULL                       | pending/paid/cancelled/completed |
| currency    | VARCHAR(3)   | NOT NULL, DEFAULT 'SEK'        | Currency code                    |
| paymentId   | VARCHAR(255) | NULL                           | Stripe payment intent ID         |
| email       | VARCHAR(255) | NOT NULL                       | Customer email                   |
| firstName   | VARCHAR(100) | NOT NULL                       | Customer first name              |
| lastName    | VARCHAR(100) | NOT NULL                       | Customer last name               |
| address     | VARCHAR(255) | NULL                           | Billing address                  |
| city        | VARCHAR(100) | NULL                           | Billing city                     |
| postalCode  | VARCHAR(20)  | NULL                           | Billing postal code              |
| country     | VARCHAR(2)   | NOT NULL, DEFAULT 'SE'         | Country code (ISO 3166-1 alpha-2)|
| createdAt   | TIMESTAMP    | NOT NULL                       | Record creation timestamp        |
| updatedAt   | TIMESTAMP    | NOT NULL                       | Record update timestamp          |

### OrderItems
Junction table storing individual items within each order.

| Column      | Type         | Constraints                    | Description                      |
|-------------|--------------|--------------------------------|----------------------------------|
| id          | UUID         | PRIMARY KEY                    | Unique identifier                |
| orderId     | UUID         | FOREIGN KEY → Orders.id        | Order reference                  |
| serviceId   | UUID         | FOREIGN KEY → Services.id      | Service reference                |
| quantity    | INTEGER      | NOT NULL, DEFAULT 1            | Item quantity                    |
| price       | DECIMAL(10,2)| NOT NULL                       | Price at time of purchase        |
| serviceName | VARCHAR(255) | NOT NULL                       | Service name (snapshot)          |
| createdAt   | TIMESTAMP    | NOT NULL                       | Record creation timestamp        |
| updatedAt   | TIMESTAMP    | NOT NULL                       | Record update timestamp          |

### PortfolioItems
Stores portfolio project showcases.

| Column         | Type         | Constraints                    | Description                      |
|----------------|--------------|--------------------------------|----------------------------------|
| id             | UUID         | PRIMARY KEY                    | Unique identifier                |
| title_en       | VARCHAR(255) | NOT NULL                       | Project title (English)          |
| title_sv       | VARCHAR(255) | NOT NULL                       | Project title (Swedish)          |
| description_en | TEXT         | NOT NULL                       | Project description (English)    |
| description_sv | TEXT         | NOT NULL                       | Project description (Swedish)    |
| category       | VARCHAR(100) | NOT NULL                       | Project category                 |
| techStack      | JSON         | NOT NULL                       | Technologies used (array)        |
| projectUrl     | VARCHAR(500) | NULL                           | Live project URL                 |
| imageUrl       | VARCHAR(500) | NOT NULL                       | Main project image URL           |
| thumbnailUrl   | VARCHAR(500) | NULL                           | Thumbnail image URL              |
| featured       | BOOLEAN      | NOT NULL, DEFAULT false        | Featured on homepage             |
| order          | INTEGER      | NOT NULL, DEFAULT 0            | Display order                    |
| isPublished    | BOOLEAN      | NOT NULL, DEFAULT true         | Publication status               |
| completedDate  | DATE         | NULL                           | Project completion date          |
| createdAt      | TIMESTAMP    | NOT NULL                       | Record creation timestamp        |
| updatedAt      | TIMESTAMP    | NOT NULL                       | Record update timestamp          |

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);

-- Services
CREATE INDEX idx_services_category ON Services(category);
CREATE INDEX idx_services_isActive ON Services(isActive);

-- Orders
CREATE INDEX idx_orders_userId ON Orders(userId);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_orders_orderNumber ON Orders(orderNumber);
CREATE INDEX idx_orders_createdAt ON Orders(createdAt);

-- OrderItems
CREATE INDEX idx_orderitems_orderId ON OrderItems(orderId);
CREATE INDEX idx_orderitems_serviceId ON OrderItems(serviceId);

-- PortfolioItems
CREATE INDEX idx_portfolio_category ON PortfolioItems(category);
CREATE INDEX idx_portfolio_featured ON PortfolioItems(featured);
CREATE INDEX idx_portfolio_isPublished ON PortfolioItems(isPublished);
CREATE INDEX idx_portfolio_order ON PortfolioItems(order);
```

## Relationships

- **Users ↔ Orders**: One-to-Many (Optional - guests can order)
- **Orders ↔ OrderItems**: One-to-Many
- **Services ↔ OrderItems**: One-to-Many
- **PortfolioItems**: Standalone (no foreign keys)

## Sample Data

### Services
```json
[
  {
    "name_en": "Landing Page Design",
    "name_sv": "Landningssida Design",
    "price": 15000,
    "currency": "SEK",
    "category": "web-design"
  },
  {
    "name_en": "Full-Stack Web Application",
    "name_sv": "Full-Stack Webbapplikation",
    "price": 75000,
    "currency": "SEK",
    "category": "web-development"
  }
]
```
