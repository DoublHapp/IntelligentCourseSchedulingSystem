package com.example.back_end.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    @Column(name = "course_id")
    String courseId;

    @Column(name = "course_name")
    String courseName;

    @Column(name = "class_room_id")
    String classRoomId;

    @Column(name = "class_room_name")
    String classRoomName;

    @Id
    @Column(name = "teaching_class_id")
    String teachingClassId;
    //时间
    //格式: 5:1-2 周五1到2节
    String slot;
    //周数
    //格式: 1,2,3,4,5,6,7,8,9,10,11,12
    String weeks;
}
