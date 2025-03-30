# Timer App

A React Native application for managing multiple timers with categories, history, and additional features.

## Features
- **Core Functionality**:
  - Create and manage multiple timers with names, durations, and categories.
  - Start, pause, and reset individual timers.
  - Visual progress bars for each timer.

- **Enhanced Functionality**:
  - **Bulk Actions**: Start, pause, or reset all timers in a category.
  - **User Feedback**: Modal notification when a timer completes.
  - **Persistence**: Timers and history persist across app restarts using AsyncStorage.
  - **Timer History**: View completed timers with timestamps on a separate screen.
  - **Customizable Alerts**: Optional halfway alert for each timer.

- **Bonus Features**:
  - **Export Timer Data**: Copy timer history to clipboard as JSON.
  - **Custom Themes**: Toggle between light and dark modes.
  - **Category Filtering**: Filter timers by category.

## Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- React Native CLI (`npm install -g react-native-cli`)
- Android Studio (for Android) or Xcode (for iOS)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/iamashishnishad/timers-app.git
   cd timer-app
   npm install
   npx expo start

