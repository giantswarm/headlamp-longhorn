# Dockerfile
# Stage 1: Build the headlamp-longhorn plugin
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /plugin

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the plugin source code
COPY . .

# Build the plugin using the headlamp-plugin tool
# This creates the necessary files in the /plugin/dist directory
RUN npm run build

# Stage 2: Create the final image containing only the built plugin artifacts
FROM alpine:latest

# Create the directory structure expected by Headlamp (/plugins/<plugin-folder-name>)
# Using 'headlamp-longhorn' as the folder name based on repo/directory structure
RUN mkdir -p /plugins/headlamp-longhorn

# Copy the built plugin files (dist/) and package.json from the builder stage
COPY --from=builder /plugin/dist/ /plugins/headlamp-longhorn/
COPY --from=builder /plugin/package.json /plugins/headlamp-longhorn/

# Optional: Set permissions if needed, though typically handled by volume mounts/Headlamp itself
# RUN chown -R <someuser>:<somegroup> /plugins

# No CMD or ENTRYPOINT needed, this image just holds files. 