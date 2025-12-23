# Use a lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy app source
COPY app.js .

# Expose port 80
EXPOSE 80

# Run the app
CMD [ "node", "app.js" ]
