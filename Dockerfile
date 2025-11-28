### PART 1: front end NodeJS library build
from node:20-bookworm AS node_builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY ./src/static/scripts ./src/static/scripts

RUN npm run build

### PART 2: backend python build

FROM python:3.10-bookworm AS py_builder

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV PYTHONPATH=/app

WORKDIR /app/backend
COPY requirements.txt ./

# can I remove this block?
RUN apt-get update || true \
	&& apt-get install -y --allow-downgrades --allow-unauthenticated ca-certificates debian-archive-keyring \
	&& rm -rf /var/lib/apt/lists/* \ 
	&& apt-get update

#RUN apt-get update && apt-get install -y build-essential python3-dev libffi-dev libssl-dev cargo && rm -rf /var/lib/apt/lists/*

RUN pip install --prefix=/install --no-cache-dir --prefer-binary -r requirements.txt


### PART 3: runtime

FROM python:3.10-slim-bookworm as runtime

WORKDIR /app

COPY --from=py_builder /install /usr/local

# likely does not work...?
COPY src/ ./backend

COPY --from=node_builder /app/frontend/dist ./frontend_dist

CMD ["python", "-m", "src/app.py"]
