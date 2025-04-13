package com.example.back_end.util;

public class PersonalizedRequest extends com.example.back_end.entity.PersonalizedRequest {

    public PersonalizedRequest(Long id, Long userId, String username, String userIdentity, String taskId, String preferDay, String preferPeriod) {
        setId(id);
        setUserId(userId);
        setUsername(username);
        setUserIdentity(userIdentity);
        setTaskId(taskId);
        setPreferDay(preferDay);
        setPreferPeriod(preferPeriod);
    }

    public PersonalizedRequest(com.example.back_end.entity.PersonalizedRequest entity) {
        setId(entity.getId());
        setUserId(entity.getUserId());
        setUsername(entity.getUsername());
        setUserIdentity(entity.getUserIdentity());
        setTaskId(entity.getTaskId());
        setPreferDay(entity.getPreferDay());
        setPreferPeriod(entity.getPreferPeriod());
    }
    
    public com.example.back_end.entity.PersonalizedRequest toEntity() {
        com.example.back_end.entity.PersonalizedRequest entity = new com.example.back_end.entity.PersonalizedRequest();
        entity.setId(this.getId());
        entity.setUserId(this.getUserId());
        entity.setUsername(this.getUsername());
        entity.setUserIdentity(this.getUserIdentity());
        entity.setTaskId(this.getTaskId());
        entity.setPreferDay(this.getPreferDay());
        entity.setPreferPeriod(this.getPreferPeriod());
        return entity;
    }
}
