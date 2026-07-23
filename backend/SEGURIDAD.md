# Seguridad implementada - EPIC-3

## RNF-5: Cifrado y protección de datos

- **Contraseñas:** se almacenan como hash irreversible usando bcrypt (10 rondas de sal), nunca en texto plano. Archivo: `src/services/auth.service.js`.
- **Autenticación:** JWT firmado con clave secreta (`JWT_SECRET`), con expiración de 8 horas por sesión.
- **Autorización:** middleware de roles (`permitirRoles`) que restringe cada endpoint según el rol del usuario autenticado (RNF-4).
- **Cabeceras HTTP:** se usa el paquete `helmet` para aplicar automáticamente cabeceras de seguridad recomendadas (protección contra XSS, sniffing de tipo MIME, clickjacking, entre otros).
- **Credenciales fuera del código fuente:** las variables sensibles (`DATABASE_URL`, `JWT_SECRET`) viven en `.env`, el cual está excluido de Git mediante `.gitignore`.

## Recomendación para producción (fuera del alcance del entorno académico)

- Servir la aplicación bajo **HTTPS/TLS** (certificado SSL) para cifrar los datos en tránsito entre el cliente y el servidor.
- Rotar periódicamente el `JWT_SECRET` en un entorno real.
