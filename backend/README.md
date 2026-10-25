User Module
│
├── Entity
│   ├── User
│   └── Role
│
├── Repository
│   └── UserRepository
│
├── DTO
│   ├── CreateUserRequest
│   ├── UpdateUserRequest
│   └── UserResponse
│
├── Service
│   └── UserService
│
├── Controller
│   └── UserController
│
└── Exception
    └── GlobalExceptionHandler








DTOs                    ✅
Validation              ✅
Global Exception        ✅
       ↓
Password Hashing        
       ↓
Spring Security
       ↓
JWT Authentication
       ↓
Role-Based Access
       ↓
Doctor / Patient          ← NEXT
       ↓
Appointment
       ↓
Medical Records
       ↓
Prescription
       ↓
Billing
       ↓
React Frontend