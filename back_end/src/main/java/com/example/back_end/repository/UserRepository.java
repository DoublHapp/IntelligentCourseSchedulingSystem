package com.example.back_end.repository;

import org.springframework.stereotype.Repository;

import com.example.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Repository
public interface  UserRepository extends JpaRepository<User,Long>{
    Optional<User> findByUsername(String username);
    
    Optional<User> findByUsernameAndPasswordAndUserIdentity(String username, String password, String userIdentity);
    
    boolean existsByUsername(String username);
}
