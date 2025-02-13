# Use an official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install -g npm@11.1.0

# Copy the entire frontend project to the container
COPY . .

# Expose the development server port
EXPOSE 3000

# Command to start the Vite development server
CMD ["npm", "run", "dev"]
