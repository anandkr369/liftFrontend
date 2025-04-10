# Elevator Status Dashboard

A real-time elevator monitoring system that displays the status of three elevators using the Adafruit IO API.

## Setup

1. Replace `YOUR_USERNAME` and `YOUR_AIO_KEY` in `script.js` with your Adafruit IO credentials
2. Create the following feeds in your Adafruit IO dashboard:
   - elevator1
   - elevator2
   - elevator3
   - load-status

## Features

- Real-time monitoring of 3 elevators
- Current floor display
- Elevator status (Moving/Stopped)
- Load status monitoring
- Issue reporting functionality

## Usage

Simply open `index.html` in a web browser to view the dashboard. The status will update every 5 seconds automatically.
