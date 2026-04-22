@echo off
cd ../backend
echo y | npx prisma migrate dev --name add_unique_certificado_pair
