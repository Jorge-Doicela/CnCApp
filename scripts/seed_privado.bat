@echo off
cd ../backend
echo Starting targeted seed... > seed_log.txt
npx tsx prisma/seed-privado.ts >> seed_log.txt 2>&1
echo Finished targeted seed. >> seed_log.txt
