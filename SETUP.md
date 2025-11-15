# NextAuth.js Multi-Provider Authentication

Esta aplicación implementa autenticación completa con múltiples proveedores usando NextAuth.js.

## ✨ Características Implementadas

### 1. **Autenticación con Credenciales (CredentialsProvider)**
- Login con email y contraseña
- Validación de credenciales
- Cifrado de contraseñas con bcryptjs

### 2. **Sistema de Registro de Usuarios**
- Formulario de registro completo
- Validación de datos (email, contraseña, confirmación)
- Almacenamiento seguro de contraseñas hasheadas

### 3. **Bloqueo por Intentos Fallidos**
- Rastrea intentos de login fallidos
- Bloquea cuenta después de 5 intentos fallidos
- Bloqueo automático por 15 minutos
- Mensajes informativos al usuario sobre intentos restantes

### 4. **Autenticación con GitHub (GitHubProvider)**
- Login con cuenta de GitHub
- OAuth 2.0

### 5. **Autenticación con Google (GoogleProvider)**
- Login con cuenta de Google (ya estaba configurado)
- OAuth 2.0

## 🚀 Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env.local` ya contiene las configuraciones de Google. Necesitas agregar tus credenciales de GitHub:

#### Obtener Credenciales de GitHub:

1. Ve a https://github.com/settings/developers
2. Click en "New OAuth App"
3. Completa:
   - **Application name**: Next Auth App
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copia el **Client ID** y **Client Secret**
5. Actualiza `.env.local`:

```env
GITHUB_CLIENT_ID=tu_client_id_aquí
GITHUB_CLIENT_SECRET=tu_client_secret_aquí
```

### 3. Ejecutar la Aplicación

```bash
npm run dev
```

Visita: http://localhost:3000

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.tsx          # Configuración de NextAuth
│   │       └── register/
│   │           └── route.ts           # API de registro
│   ├── register/
│   │   └── page.tsx                   # Página de registro
│   ├── signIn/
│   │   └── page.tsx                   # Página de login
│   └── dashboard/
│       └── page.tsx                   # Dashboard protegido
├── lib/
│   └── db.ts                          # Base de datos en memoria
└── types/
    └── next-auth.d.ts                 # Type definitions de NextAuth
```

## 🔐 Seguridad Implementada

### Cifrado de Contraseñas
- Uso de **bcryptjs** con salt rounds = 10
- Las contraseñas nunca se almacenan en texto plano

### Protección contra Fuerza Bruta
- Máximo 5 intentos de login
- Bloqueo automático de 15 minutos
- Contador de intentos restantes
- Reset automático al login exitoso

### Validaciones
- Email válido (regex)
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña en registro
- Verificación de usuario existente

## 🎯 Uso de la Aplicación

### Registrar un Nuevo Usuario

1. Ve a http://localhost:3000/register
2. Completa el formulario:
   - Nombre
   - Email
   - Contraseña (mín. 6 caracteres)
   - Confirmar contraseña
3. Click en "Register"
4. Serás redirigido al login con mensaje de éxito

### Iniciar Sesión

1. Ve a http://localhost:3000/signIn
2. Opciones disponibles:
   - **Credenciales**: Email y contraseña
   - **Google**: Click en botón de Google
   - **GitHub**: Click en botón de GitHub

### Ejemplo de Usuario para Pruebas

Después de registrar un usuario, puedes usar esas credenciales. Por ejemplo:

```
Email: test@example.com
Password: test123
```

## 🔄 Flujo de Autenticación

### Flujo con Credenciales:
1. Usuario ingresa email/password
2. Sistema verifica si cuenta está bloqueada
3. Busca usuario en base de datos
4. Compara contraseña hasheada
5. Si falla: incrementa contador de intentos
6. Si tiene éxito: resetea intentos y crea sesión
7. Redirecciona al dashboard

### Flujo con OAuth (Google/GitHub):
1. Usuario hace click en botón de proveedor
2. Redirecciona a página de autorización
3. Usuario autoriza la aplicación
4. Callback con datos del usuario
5. Crea sesión automáticamente
6. Redirecciona al dashboard

## 📊 Base de Datos

Actualmente usa una base de datos **en memoria** (`src/lib/db.ts`) para demostración. 

### Para Producción:
Reemplaza con una base de datos real:
- **MongoDB** con Mongoose
- **PostgreSQL** con Prisma
- **MySQL** con TypeORM
- etc.

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **NextAuth.js 4** - Autenticación
- **TypeScript** - Tipado estático
- **bcryptjs** - Hash de contraseñas
- **Tailwind CSS** - Estilos
- **React Icons** - Iconos

## 📝 Notas Importantes

1. **Base de Datos en Memoria**: Los datos se pierden al reiniciar el servidor
2. **NEXTAUTH_SECRET**: En producción, usa un secret único y seguro
3. **URLs de Callback**: Actualiza las URLs en producción
4. **HTTPS**: En producción, siempre usa HTTPS

## 🚨 Manejo de Errores

### Cuenta Bloqueada
```
"Account locked due to multiple failed login attempts. Try again in 15 minutes."
```

### Credenciales Inválidas
```
"Invalid email or password. X attempts remaining."
```

### Usuario Existente
```
"User with this email already exists"
```

## 🎨 Personalización

### Cambiar Tiempo de Bloqueo
En `src/lib/db.ts`, línea 59:
```typescript
existing.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
```

### Cambiar Número de Intentos
En `src/lib/db.ts`, línea 58:
```typescript
if (existing.attempts >= 5) { // Cambiar 5 por el número deseado
```

### Cambiar Requisitos de Contraseña
En `src/app/api/auth/register/route.ts`, línea 24:
```typescript
if (password.length < 6) { // Cambiar 6 por el mínimo deseado
```

## ✅ Testing

### Probar Bloqueo de Cuenta:
1. Intenta login con contraseña incorrecta 5 veces
2. Verifica mensaje de cuenta bloqueada
3. Espera 15 minutos o reinicia servidor
4. Intenta nuevamente

### Probar Registro:
1. Registra usuario con email único
2. Verifica redirección a login
3. Intenta registrar mismo email
4. Verifica error de usuario existente

## 📚 Recursos

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Apps](https://github.com/settings/developers)
- [Google Cloud Console](https://console.cloud.google.com/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

**¡Listo para usar! 🎉**
