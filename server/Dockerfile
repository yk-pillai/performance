# Use official Node.js image as base
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port for backend (5000)
EXPOSE 5000
RUN npm install -g nodemon

# Command to run the backend
CMD ["npm", "run", "dev"]
