# Use official Node.js image
FROM node:20

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "index.js"]
