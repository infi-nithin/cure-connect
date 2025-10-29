FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --output-path=./dist/cure-connect

FROM nginx:1.25-alpine
COPY --from=build /app/dist/cure-connect /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]