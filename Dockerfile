# PART 1: frontend ReactJS webpack build
FROM node:20-bookworm as frontend
LABEL stage=node_build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# PART 2: install Python and run app
FROM python:3.10-bookworm
LABEL stage=python_build

WORKDIR /app

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# tells Docker to look in the right places for custom modules
ENV PYTHONPATH=/app

COPY . .

RUN pip install -r requirements.txt

COPY --from=frontend /app/src/static/scripts/dist /app/src/static/scripts/dist

EXPOSE 5000

CMD ["python", "src/app.py"]
