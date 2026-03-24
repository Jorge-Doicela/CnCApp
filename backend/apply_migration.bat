@echo off
echo Running migration...
npx prisma migrate dev --name add_base64_to_plantilla
echo Migration finished.
