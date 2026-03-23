@echo off
echo Starting targeted seed... > seed_log.txt
node_modules\.bin\tsx.cmd prisma/seed-privado-only.ts >> seed_log.txt 2>&1
echo Finished targeted seed. >> seed_log.txt
