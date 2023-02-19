FROM node:16.19.0-alpine3.16 as builder

# create app directory in container
RUN mkdir -p /app

# set /app directory as default working directory
WORKDIR /app

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /app/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /app/

# Build the 'dist' directory
RUN yarn build

FROM node:16.19.0-alpine3.16

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# expose port 4000
EXPOSE 4000

# cmd to start service
CMD [ "yarn", "start"]
