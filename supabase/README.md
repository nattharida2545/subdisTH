
# Supabase Schema and Sample Data

This directory contains SQL scripts for creating the database schema and inserting sample data for the Pharmacy Queue Management System.

## Files

- `schema.sql`: Contains the database schema including tables for patients, medications, queues, and appointments.
- `sample_data.sql`: Contains sample data to populate the database for testing and development.

## Schema Overview

The database consists of four main tables:

1. **patients**: Stores patient information including personal details and contact information.
2. **medications**: Stores information about medications including stock levels.
3. **queues**: Tracks patient queues with different types and statuses.
4. **appointments**: Manages patient appointments and their status.

## Sample Data

The sample data includes:
- 10 patients with varied demographics
- 10 medications with different stock levels
- 5 queues in different states (waiting, active, completed)
- 5 appointments (scheduled and completed)

## Usage

To reset and recreate the database:

1. Run `schema.sql` to create the tables
2. Run `sample_data.sql` to populate the tables with sample data

Note: The sample data script should be run after the schema script since it depends on the tables existing first.
