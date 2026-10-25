// package com.hospital.config;

// import com.hospital.entity.User;
// import com.hospital.repository.UserRepository;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.crypto.password.PasswordEncoder;

// import java.util.Map;

// @Configuration
// public class PasswordResetRunner {

//     @Bean
//     CommandLineRunner resetExistingPasswords(
//             UserRepository userRepository,
//             PasswordEncoder passwordEncoder) {

//         return args -> {

//             // Temporary passwords for existing accounts.
//             // Change these passwords after logging in.
//             Map<String, String> passwords = Map.of(
//                     "admin2", "Admin@123",
//                     "doctor1", "Doctor@123",
//                     "reception1", "Reception@123",
//                     "patient1", "Patient@123",
//                     "doctor2", "Doctor2@123",
//                     "patient2", "Patient2@123",
//                     "pavii", "Pavii@123",
//                     "Naveen", "Naveen@123",
//                     "nishanth", "Nishanth@123"
//             );

//             for (Map.Entry<String, String> entry : passwords.entrySet()) {

//                 User user = userRepository
//                         .findByUsername(entry.getKey())
//                         .orElse(null);

//                 if (user != null) {
//                     user.setPassword(
//                             passwordEncoder.encode(entry.getValue())
//                     );

//                     userRepository.save(user);

//                     System.out.println(
//                             "Password reset completed for: "
//                                     + user.getUsername()
//                     );
//                 } else {
//                     System.out.println(
//                             "User not found: " + entry.getKey()
//                     );
//                 }
//             }
//         };
//     }
// }