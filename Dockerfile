# Node.jsの公式イメージから
FROM node:16

RUN npm install -g npm

# 作業ディレクトリを/appに設定
WORKDIR /app