FROM node:slim
WORKDIR /moments-be
COPY . /moments-be
RUN npm install
EXPOSE 3001
CMD node index.js