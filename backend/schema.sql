-- DevOps Hub Database Schema
-- Created: Day 2

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('admin','pm','developer','intern')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('active','completed','archived')),
  created_by INTEGER REFERENCES Users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES Projects(id),
  title VARCHAR(150),
  description TEXT,
  assigned_to INTEGER REFERENCES Users(id),
  status VARCHAR(20) CHECK (status IN ('todo','doing','done')),
  priority VARCHAR(20) CHECK (priority IN ('low','medium','high')),
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  resume_link VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('applied','interviewed','offered','active_intern','completed')),
  applied_date DATE,
  notes TEXT
);