package com.example.back_end.repository;

import com.example.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 根据用户名查询用户
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 根据用户身份查询用户
     */
    List<User> findByUserIdentity(String userIdentity);
    
    /**
     * 检查用户名是否已存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 根据用户名和密码和身份查询用户
     */
    Optional<User> findByUsernameAndPasswordAndUserIdentity(String username, String password, String userIdentity);
    
    /**
     * 根据创建时间排序查找最近创建的用户
     */
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findRecentUsers();
    
    /**
     * 查询除管理员外的所有用户
     */
    @Query("SELECT u FROM User u WHERE u.userIdentity != 'administrator'")
    List<User> findAllNonAdminUsers();
    
    /**
     * 查询用户名包含指定字符串的用户
     */
    List<User> findByUsernameContaining(String username);
}