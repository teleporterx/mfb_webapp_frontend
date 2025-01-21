# Use an official Node.js image as the base image
FROM node:23.4.0-alpine

# Install curl (or any other utilities you may need)
RUN apk add --no-cache curl

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port (5000 as specified in your script)
EXPOSE 5000

# Run the development server
CMD ["npm", "run", "dev"]