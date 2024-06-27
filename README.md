# Secret Notes API

## Description

Secret Notes API is a NestJS application that allows users to create, read, update, and delete secret notes. Each note is encrypted when stored and can be decrypted when retrieved.

## Encryption 

The encryption used is AES because we are encrypting notes which can be bigger in size so symmetric encryption is preferred.

## Code Documentation

Each service method is documented using JSDoc comments, explaining the purpose, parameters, return values, and possible exceptions.

## Swagger Documentation

The API documentation is available at http://localhost:3000/api once the application is running.

## Project Structure

- `src/app.module.ts` - The root module of the application.
- `src/secret-note/secret-note.module.ts` - The module for secret notes.
- `src/secret-note/secret-note.service.ts` - The service for handling secret note business logic.
- `src/secret-note/secret-note.controller.ts` - The controller for handling HTTP requests related to secret notes.
- `src/secret-note/secret-note.entity.ts` - The entity representing the secret note.

## Features

- Create a new secret note
- Retrieve all secret notes
- Retrieve a single secret note (either encrypted or decrypted)
- Update a secret note
- Delete a secret note

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)

## Installation

```bash
$ npm install
```

## Docker Setup for Secret Notes API

The Dockerfile is used to create a Docker image for the Secret Notes API application. The docker-compose.yml configures the Secret Notes API service and a PostgreSQL database service. So the PostgresSQL and the Secret Notes API can be started with following docker compose command..

```bash
$ docker-compose up --build -d
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Limitation: Encryption Key Storage

The encryption key used to encrypt and decrypt notes is stored in an environment variable (ENCRYPTION_KEY). While this method is convenient and commonly used, it is not secure.