# Meal Prep Optimizer

A React application that helps users find the most cost-effective way to shop for meal prepped meals, taking into account both grocery prices and gas costs.

## Features

- Generate personalized meal plans using Gemini AI
- Compare prices across multiple grocery stores
- Calculate total cost including gas expenses
- Consider dietary restrictions and budget constraints

## Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Gemini API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd meal-prep-optimizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter your meal preferences:
   - Number of meals per day
   - Number of days per week
   - Dietary restrictions
   - Location (zip code or address)
   - Budget

2. Click "Find Optimal Plan" to generate recommendations

3. View the results page to see:
   - Your personalized meal plan
   - Cost breakdown
   - Recommended stores with prices and distances

## Technologies Used

- React
- TypeScript
- Material-UI
- Gemini AI API
- Axios
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.