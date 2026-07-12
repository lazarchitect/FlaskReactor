# Note - copies and install commands are grouped in such a way to maximize caching

# PART 1: frontend ReactJS webpack build
FROM node:22-bookworm as frontend

WORKDIR /app

# ci (clean install) checks package-lock.json, throws on mismatched deps
COPY package*.json ./
RUN npm ci

COPY .babelrc webpack.config.js ./
COPY src/frontend ./src/frontend
RUN npm run build

# PART 2: install Python and run app
FROM python:3.10-bookworm

WORKDIR /app

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
# tells Docker to look in the right places for custom modules
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY --from=frontend /app/src/frontend/scripts/dist /app/src/frontend/scripts/dist

EXPOSE 5000

CMD ["python", "src/app.py"]
