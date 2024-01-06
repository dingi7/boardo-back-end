# API Endpoints Documentation

## Board Controller (`boardController.ts`)

### `POST /items/boards`
- **Description**: Create a new board.
- **Request Body (`BoardPayload`)**:
  - `name`: string
  - `backgroundUrl`: string (optional)

### `GET /items/boards/org/:orgId`
- **Description**: Get boards by organization ID.
- **URL Parameters**:
  - `orgId`: string

## Card Controller (`cardController.ts`)

### `POST /items/cards`
- **Description**: Create a new card.
- **Request Body (`CardPayload`)**:
  - `content`: string
  - `listId`: string
  - `boardId`: string (optional)

### `DELETE /items/cards/:cardId`
- **Description**: Delete a card by ID.
- **URL Parameters**:
  - `cardId`: string

## List Controller (`listController.ts`)

### `POST /items/list`
- **Description**: Create a new list.
- **Request Body (`listPayload`)**:
  - `name`: string
  - `boardId`: string

## Users Controller (`usersController.ts`)

### `POST /auth/register`
- **Description**: Register a new user.
- **Request Body (`OrgPayload`)**:
  - `name`: string (optional)
  - `password`: string

### `POST /auth/login`
- **Description**: User login.
- **Request Body**:
  - (Details not provided in initial summary)

### `POST /auth/joinOrg/:id`
- **Description**: Join an organization.
- **URL Parameters**:
  - `id`: string
- **Request Body**:
  - (Details not provided in initial summary)

### `POST /auth/createOrg`
- **Description**: Create a new organization.
- **Request Body**:
  - (Details not provided in initial summary)

### `GET /auth/orgs`
- **Description**: Get organizations associated with a user.
- **Request Body**: None