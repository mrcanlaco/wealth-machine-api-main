# wealth-machine-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.1.34. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


# Redis Docker
```bash
docker-compose up -d
```

# Check redis
```bash
docker exec -it wealth_machine_redis redis-cli
```

# Redis commands
```bash
# Kiểm tra keys
KEYS *

# Xem TTL của key
TTL auth:user:{userId}

# Monitor Redis operations
MONITOR

# Xem memory usage
INFO memory
```