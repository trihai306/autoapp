# Tài Liệu Tham Số Workflow - TikTok Auto Bot

## Tổng Quan
Tài liệu này mô tả đầy đủ tất cả các tham số cần thiết cho các workflow types được hỗ trợ trong `handleWorkflowCommand` của TikTok Auto Bot.

## Cấu Trúc JSON Chung
```json
{
  "success": true,
  "tasks": [
    {
      "id": 78,
      "tiktok_account_id": 11,
      "interaction_scenario_id": 11,
      "device_id": 11,
      "task_type": "workflow_type",
      "parameters": "{\"account_username\":\"username\",\"scenario_scripts\":[...]}",
      "priority": "medium",
      "status": "pending",
      "account": {
        "id": 11,
        "username": "username",
        "email": "email@example.com",
        "password": "password",
        "two_factor_enabled": true,
        "two_factor_backup_codes": ["code1", "code2"]
      }
    }
  ]
}
```

## 1. NOTIFICATION WORKFLOW

### Type: `"notification"`

### Tham Số:
```json
{
  "count_from": 1,           // Số lượng thông báo tối thiểu (int, default: 1)
  "count_to": 1,             // Số lượng thông báo tối đa (int, default: 1)
  "gap_from": 1,             // Khoảng thời gian đọc tối thiểu (int, default: 1)
  "gap_to": 1,               // Khoảng thời gian đọc tối đa (int, default: 1)
  "follow_from": 1,          // Khoảng thời gian follow tối thiểu (int, default: 1)
  "follow_to": 1,            // Khoảng thời gian follow tối đa (int, default: 1)
  "count_follow": false,     // Có đếm follow không (boolean, default: false)
  "count_say_hi": false      // Có đếm chào hỏi không (boolean, default: false)
}
```

---

## 2. RANDOM VIDEO WORKFLOW

### Type: `"random_video"` hoặc `"random_video_interaction"`

### Tham Số:
```json
{
  "name": "Tương tác video ngẫu nhiên",           // Tên workflow (string)
  "description": "Mô tả workflow",                // Mô tả (string)
  "suggestion_type": "suggest",                   // Loại gợi ý (string, default: "suggest")
  "limit_mode": "video",                          // Chế độ giới hạn (string, default: "video")
  "limit_video_from": 1,                          // Video bắt đầu (int, default: 1)
  "limit_video_to": 5,                            // Video kết thúc (int, default: 5)
  "limit_time_from": 30,                          // Thời gian bắt đầu (int, default: 30)
  "limit_time_to": 60,                            // Thời gian kết thúc (int, default: 60)
  "view_from": 3,                                 // Thời gian xem tối thiểu (int, default: 3)
  "view_to": 10,                                  // Thời gian xem tối đa (int, default: 10)
  
  // Tương tác Like
  "enable_emotion": false,                        // Bật like (boolean, default: false)
  "emotion_rate": 100,                            // Tỷ lệ like (int, default: 100)
  "emotion_gap_from": 1,                          // Delay like tối thiểu (int, default: 1)
  "emotion_gap_to": 3,                            // Delay like tối đa (int, default: 3)
  
  // Tương tác Follow
  "enable_follow": false,                         // Bật follow (boolean, default: false)
  "follow_rate": 100,                             // Tỷ lệ follow (int, default: 100)
  "follow_gap_from": 1,                           // Delay follow tối thiểu (int, default: 1)
  "follow_gap_to": 3,                             // Delay follow tối đa (int, default: 3)
  
  // Tương tác Favorite
  "enable_favorite": false,                       // Bật favorite (boolean, default: false)
  "favorite_rate": 100,                           // Tỷ lệ favorite (int, default: 100)
  "favorite_gap_from": 1,                         // Delay favorite tối thiểu (int, default: 1)
  "favorite_gap_to": 3,                           // Delay favorite tối đa (int, default: 3)
  
  // Tương tác Repost
  "enable_repost": false,                         // Bật repost (boolean, default: false)
  "repost_rate": 100,                             // Tỷ lệ repost (int, default: 100)
  "repost_gap_from": 1,                           // Delay repost tối thiểu (int, default: 1)
  "repost_gap_to": 3,                             // Delay repost tối đa (int, default: 3)
  
  // Tương tác Comment
  "enable_comment": false,                        // Bật comment (boolean, default: false)
  "comment_rate": 100,                            // Tỷ lệ comment (int, default: 100)
  "comment_gap_from": 1,                          // Delay comment tối thiểu (int, default: 1)
  "comment_gap_to": 3,                            // Delay comment tối đa (int, default: 3)
  "comment_contents": [],                         // Danh sách nội dung comment (array)
  "content_group": ""                             // Nhóm nội dung (string, default: "")
}
```

---

## 3. RANDOM LIVE WORKFLOW

### Type: `"random_live"`

### Tham Số:
```json
{
  // Sử dụng RandomLiveInteractionWorkflow.fromJsonParameters()
  // Tất cả tham số được chuyển đổi thành Map<String, Any?>
}
```

---

## 4. SPECIFIC VIDEO WORKFLOW

### Type: `"specific_video"`

### Tham Số:
```json
{
  "link_list": ["url1", "url2"],                  // Danh sách link video (array hoặc string)
  "view_from": 0,                                 // Thời gian xem tối thiểu (int, default: 0)
  "view_to": 0,                                   // Thời gian xem tối đa (int, default: 0)
  
  // Tương tác Follow
  "enable_follow": false,                         // Bật follow (boolean, default: false)
  "follow_rate": 0,                               // Tỷ lệ follow (int, default: 0)
  "follow_gap_from": 0,                           // Delay follow tối thiểu (int, default: 0)
  "follow_gap_to": 0,                             // Delay follow tối đa (int, default: 0)
  
  // Tương tác Favorite
  "enable_favorite": false,                       // Bật favorite (boolean, default: false)
  "favorite_rate": 0,                             // Tỷ lệ favorite (int, default: 0)
  "favorite_gap_from": 0,                         // Delay favorite tối thiểu (int, default: 0)
  "favorite_gap_to": 0,                           // Delay favorite tối đa (int, default: 0)
  
  // Tương tác Repost
  "enable_repost": false,                         // Bật repost (boolean, default: false)
  "repost_rate": 0,                               // Tỷ lệ repost (int, default: 0)
  "repost_gap_from": 0,                           // Delay repost tối thiểu (int, default: 0)
  "repost_gap_to": 0,                             // Delay repost tối đa (int, default: 0)
  
  // Tương tác Like
  "enable_emotion": false,                        // Bật like (boolean, default: false)
  "emotion_rate": 0,                              // Tỷ lệ like (int, default: 0)
  "emotion_gap_from": 0,                          // Delay like tối thiểu (int, default: 0)
  "emotion_gap_to": 0,                            // Delay like tối đa (int, default: 0)
  
  // Tương tác Comment
  "enable_comment": false,                        // Bật comment (boolean, default: false)
  "comment_rate": 0,                              // Tỷ lệ comment (int, default: 0)
  "comment_gap_from": 0,                          // Delay comment tối thiểu (int, default: 0)
  "comment_gap_to": 0,                            // Delay comment tối đa (int, default: 0)
  "comment_tag": false,                           // Bật tag comment (boolean, default: false)
  "comment_tag_value": null,                      // Giá trị tag comment (string, default: null)
  "comment_contents": [],                         // Danh sách nội dung comment (array)
  "comment_placeholder": null,                    // Placeholder comment (string, default: null)
  
  "limit_video_from": 1,                          // Video bắt đầu (int, default: 1)
  "limit_video_to": 1                             // Video kết thúc (int, default: 1)
}
```

---

## 5. KEYWORD VIDEO WORKFLOW

### Type: `"keyword_video"`

### Tham Số:
```json
{
  "name": "Tương tác video theo từ khóa",         // Tên workflow (string)
  "limit_mode": "video",                          // Chế độ giới hạn (string, default: "video")
  "limit_video_to": 5,                            // Số video tối đa mỗi từ khóa (int, default: 5)
  "keyword_list": "keyword1\nkeyword2",           // Danh sách từ khóa (string, phân cách bằng \n)
  "limit_video_from": 1,                          // Video bắt đầu (int, default: 1)
  "view_from": 3,                                 // Thời gian xem tối thiểu (int, default: 3)
  "view_to": 5,                                   // Thời gian xem tối đa (int, default: 5)
  "limit_time_to": 300,                           // Thời gian tương tác tối đa (int, default: 300)
  
  // Tương tác Like
  "enable_emotion": false,                        // Bật like (boolean, default: false)
  "emotion_rate": 0,                              // Tỷ lệ like (int, default: 0)
  "emotion_gap_from": 1,                          // Delay like tối thiểu (int, default: 1)
  "emotion_gap_to": 3,                            // Delay like tối đa (int, default: 3)
  
  // Tương tác Follow
  "enable_follow": false,                         // Bật follow (boolean, default: false)
  "follow_rate": 0,                               // Tỷ lệ follow (int, default: 0)
  "follow_gap_from": 1,                           // Delay follow tối thiểu (int, default: 1)
  "follow_gap_to": 3,                             // Delay follow tối đa (int, default: 3)
  
  // Tương tác Favorite
  "enable_favorite": false,                       // Bật favorite (boolean, default: false)
  "favorite_rate": 0,                             // Tỷ lệ favorite (int, default: 0)
  "favorite_gap_from": 1,                         // Delay favorite tối thiểu (int, default: 1)
  "favorite_gap_to": 3,                           // Delay favorite tối đa (int, default: 3)
  
  // Tương tác Repost
  "enable_repost": false,                         // Bật repost (boolean, default: false)
  "repost_rate": 0,                               // Tỷ lệ repost (int, default: 0)
  "repost_gap_from": 1,                           // Delay repost tối thiểu (int, default: 1)
  "repost_gap_to": 3,                             // Delay repost tối đa (int, default: 3)
  
  // Tương tác Comment
  "enable_comment": false,                        // Bật comment (boolean, default: false)
  "comment_rate": 0,                              // Tỷ lệ comment (int, default: 0)
  "comment_gap_from": 1,                          // Delay comment tối thiểu (int, default: 1)
  "comment_gap_to": 3,                            // Delay comment tối đa (int, default: 3)
  "comment_contents": [],                         // Danh sách nội dung comment (array)
  "comment_tag": false,                           // Bật tag comment (boolean, default: false)
  "comment_tag_value": null                       // Giá trị tag comment (string, default: null)
}
```

---

## 6. USER VIDEO WORKFLOW

### Type: `"user_video"`

### Tham Số:
```json
{
  "name": "Tương tác video theo User",            // Tên workflow (string)
  "user_list": "user1\nuser2",                    // Danh sách user (string, phân cách bằng \n)
  "link_list": "link1\nlink2",                    // Danh sách link (string, phân cách bằng \n, thay thế cho user_list)
  "limit_video_from": 1,                          // Video bắt đầu (int, default: 1)
  "limit_video_to": 2,                            // Video kết thúc (int, default: 2)
  "limit_time_to": 300,                           // Thời gian tương tác tối đa (int, default: 300)
  "view_from": 3,                                 // Thời gian xem tối thiểu (int, default: 3)
  "view_to": 5,                                   // Thời gian xem tối đa (int, default: 5)
  
  // Tương tác Like
  "enable_emotion": false,                        // Bật like (boolean, default: false)
  "emotion_rate": 0,                              // Tỷ lệ like (int, default: 0)
  "emotion_gap_from": 1,                          // Delay like tối thiểu (int, default: 1)
  "emotion_gap_to": 3,                            // Delay like tối đa (int, default: 3)
  
  // Tương tác Follow
  "enable_follow": false,                         // Bật follow (boolean, default: false)
  "follow_rate": 0,                               // Tỷ lệ follow (int, default: 0)
  "follow_gap_from": 1,                           // Delay follow tối thiểu (int, default: 1)
  "follow_gap_to": 3,                             // Delay follow tối đa (int, default: 3)
  
  // Tương tác Favorite
  "enable_favorite": false,                       // Bật favorite (boolean, default: false)
  "favorite_rate": 0,                             // Tỷ lệ favorite (int, default: 0)
  "favorite_gap_from": 1,                         // Delay favorite tối thiểu (int, default: 1)
  "favorite_gap_to": 3,                           // Delay favorite tối đa (int, default: 3)
  
  // Tương tác Repost
  "enable_repost": false,                         // Bật repost (boolean, default: false)
  "repost_rate": 0,                               // Tỷ lệ repost (int, default: 0)
  "repost_gap_from": 1,                           // Delay repost tối thiểu (int, default: 1)
  "repost_gap_to": 3,                             // Delay repost tối đa (int, default: 3)
  
  // Tương tác Comment
  "enable_comment": false,                        // Bật comment (boolean, default: false)
  "comment_rate": 0,                              // Tỷ lệ comment (int, default: 0)
  "comment_gap_from": 1,                          // Delay comment tối thiểu (int, default: 1)
  "comment_gap_to": 3,                            // Delay comment tối đa (int, default: 3)
  "comment_contents": [],                         // Danh sách nội dung comment (array)
  "comment_tag_value": null                       // Giá trị tag comment (string, default: null)
}
```

---

## 7. FOLLOW USER WORKFLOW

### Type: `"follow_user"`

### Tham Số:
```json
{
  "name": "Theo dõi User",                        // Tên workflow (string)
  "user_list": "user1\nuser2",                    // Danh sách user (string, phân cách bằng \n)
  "count_from": 1,                                // Số lượng user tối thiểu (int, default: 1)
  "count_to": 2,                                  // Số lượng user tối đa (int, default: 2)
  "gap_from": 3,                                  // Delay tối thiểu (int, default: 3)
  "gap_to": 5,                                    // Delay tối đa (int, default: 5)
  "exit_on_fail": true,                           // Thoát khi fail (boolean, default: true)
  "exit_fail_count": 1,                           // Số lần fail tối đa (int, default: 1)
  "open_link_search": false                       // Mở link bằng tìm kiếm (boolean, default: false)
}
```

---

## 8. FOLLOW KEYWORD WORKFLOW

### Type: `"follow_keyword"`

### Tham Số:
```json
{
  "name": "Theo dõi User theo từ khóa",           // Tên workflow (string)
  "keyword_list": "keyword1\nkeyword2",           // Danh sách từ khóa (string, phân cách bằng \n)
  "count_from": 1,                                // Số lượng user tối thiểu (int, default: 1)
  "count_to": 1,                                  // Số lượng user tối đa (int, default: 1)
  "gap_from": 3,                                  // Delay tối thiểu (int, default: 3)
  "gap_to": 5                                     // Delay tối đa (int, default: 5)
}
```

---

## 9. FOLLOW BACK WORKFLOW

### Type: `"follow_back"`

### Tham Số:
```json
{
  "name": "Theo dõi lại",                         // Tên workflow (string)
  "count_from": 1,                                // Số lượng user (int, default: 1)
  "gap_from": 3,                                  // Delay tối thiểu (int, default: 3)
  "gap_to": 5                                     // Delay tối đa (int, default: 5)
}
```

---

## 10. FOLLOW SUGGESTED WORKFLOW

### Type: `"follow_suggested"`

### Tham Số:
```json
{
  "name": "Theo dõi User gợi ý",                  // Tên workflow (string)
  "count_from": 1,                                // Số lượng user tối thiểu (int, default: 1)
  "count_to": 1,                                  // Số lượng user tối đa (int, default: 1)
  "gap_from": 3,                                  // Delay tối thiểu (int, default: 3)
  "gap_to": 5                                     // Delay tối đa (int, default: 5)
}
```

---

## 11. CREATE POST WORKFLOW

### Type: `"create_post"`

### Tham Số:
```json
{
  "name": "Tạo bài viết",                         // Tên workflow (string)
  "load_time_from": 200,                          // Thời gian load tối thiểu (int, default: 200)
  "load_time_to": 300,                            // Thời gian load tối đa (int, default: 300)
  "title": "Tiêu đề bài viết",                    // Tiêu đề (string)
  "content": "Nội dung bài viết",                 // Nội dung (string)
  "post_by_filename": false,                      // Đăng theo tên file (boolean, default: false)
  "auto_cut": false,                              // Tự động cắt (boolean, default: false)
  "multiple_images": false,                       // Nhiều ảnh (boolean, default: false)
  "delete_used_images": true,                     // Xóa ảnh đã dùng (boolean, default: true)
  "custom_filters": ["filter1", "filter2"],       // Bộ lọc tùy chỉnh (array)
  "filter_type": "filter_type",                   // Loại bộ lọc (string)
  "add_trending_music": false,                    // Thêm nhạc trend (boolean, default: false)
  "image_urls": ["url1", "url2"],                 // Danh sách URL ảnh (array)
  "enable_tiktok_shop": false                     // Bật TikTok Shop (boolean, default: false)
}
```

---

## 12. CHANGE NAME WORKFLOW

### Type: `"change_name"`

### Tham Số:
```json
{
  "name": "Đổi tên",                              // Tên workflow (string)
  "selection_type": "random",                     // Loại chọn (string: "random"|"custom", default: "random")
  "name_type": "vietnamese",                      // Loại tên (string: "vietnamese"|"english", default: "vietnamese")
  "name_list": ["name1", "name2"]                 // Danh sách tên (array)
}
```

---

## 13. CHANGE BIO WORKFLOW

### Type: `"change_bio"`

### Tham Số:
```json
{
  "name": "Đổi tiểu sử",                          // Tên workflow (string)
  "new_bio": "Tiểu sử mới"                        // Tiểu sử mới (string)
}
```

---

## 14. UPDATE AVATAR WORKFLOW

### Type: `"update_avatar"`

### Tham Số:
```json
{
  "name": "Cập nhật ảnh đại diện",                // Tên workflow (string)
  "image_paths": ["path1", "path2"],              // Đường dẫn ảnh cục bộ (array)
  "image_urls": ["url1", "url2"],                 // URL ảnh từ xa (array)
  "delete_used_images": false                     // Xóa ảnh đã dùng (boolean, default: false)
}
```

---

## 15. FRIEND INTERACTION WORKFLOW

### Type: `"friend_interaction"`

### Tham Số:
```json
{
  "name": "Tương tác bạn bè",                     // Tên workflow (string)
  "suggestion_type": "following",                 // Loại gợi ý (string, default: "following")
  "limit_mode": "video",                          // Chế độ giới hạn (string, default: "video")
  "limit_time_from": null,                        // Thời gian bắt đầu (int, nullable)
  "limit_time_to": null,                          // Thời gian kết thúc (int, nullable)
  "limit_friend_from": 0,                         // Friend bắt đầu (int, default: 0)
  "limit_friend_to": 0,                           // Friend kết thúc (int, default: 0)
  "view_from": 0,                                 // Thời gian xem tối thiểu (int, default: 0)
  "view_to": 0,                                   // Thời gian xem tối đa (int, default: 0)
  
  // Tương tác Like
  "enable_emotion": false,                        // Bật like (boolean, default: false)
  "emotion_rate": 0,                              // Tỷ lệ like (int, default: 0)
  "emotion_gap_from": 0,                          // Delay like tối thiểu (int, default: 0)
  "emotion_gap_to": 0,                            // Delay like tối đa (int, default: 0)
  
  // Tương tác Follow
  "enable_follow": false,                         // Bật follow (boolean, default: false)
  "follow_rate": 0,                               // Tỷ lệ follow (int, default: 0)
  "follow_gap_from": 0,                           // Delay follow tối thiểu (int, default: 0)
  "follow_gap_to": 0,                             // Delay follow tối đa (int, default: 0)
  
  // Tương tác Favorite
  "enable_favorite": false,                       // Bật favorite (boolean, default: false)
  "favorite_rate": 0,                             // Tỷ lệ favorite (int, default: 0)
  "favorite_gap_from": 0,                         // Delay favorite tối thiểu (int, default: 0)
  "favorite_gap_to": 0,                           // Delay favorite tối đa (int, default: 0)
  
  // Tương tác Repost
  "enable_repost": false,                         // Bật repost (boolean, default: false)
  "repost_rate": 0,                               // Tỷ lệ repost (int, default: 0)
  "repost_gap_from": 0,                           // Delay repost tối thiểu (int, default: 0)
  "repost_gap_to": 0,                             // Delay repost tối đa (int, default: 0)
  
  // Tương tác Comment
  "enable_comment": false,                        // Bật comment (boolean, default: false)
  "comment_rate": 0,                              // Tỷ lệ comment (int, default: 0)
  "comment_gap_from": 0,                          // Delay comment tối thiểu (int, default: 0)
  "comment_gap_to": 0,                            // Delay comment tối đa (int, default: 0)
  "comment_contents": [],                         // Danh sách nội dung comment (array)
  "comment_tag_value": null,                      // Giá trị tag comment (string, default: null)
  "comment_tag": false,                           // Bật tag comment (boolean, default: false)
  "comment_placeholder": null,                    // Placeholder comment (string, default: null)
  "user_list": ["user1", "user2"]                 // Danh sách user (array)
}
```

---

## 16. SPECIFIC LIVE WORKFLOW

### Type: `"specific_live"`

### Tham Số:
```json
{
  // Sử dụng TargetLiveInteractionWorkflow.fromJsonParameters()
  // Tất cả tham số được chuyển đổi thành Map<String, Any?>
}
```

---

## 17. FOLLOW BY ID WORKFLOW

### Type: `"follow_by_id"`

### Tham Số:
```json
{
  // Chưa được triển khai (TODO)
}
```

---

## Thông Tin Tài Khoản (Account Object)

### Cấu trúc:
```json
{
  "id": 11,                                       // ID tài khoản (int)
  "user_id": 1,                                   // ID người dùng (int)
  "username": "username",                         // Tên đăng nhập (string)
  "email": "email@example.com",                   // Email (string)
  "phone_number": null,                           // Số điện thoại (string, nullable)
  "password": "password",                         // Mật khẩu (string)
  "nickname": null,                               // Biệt danh (string, nullable)
  "avatar_url": null,                             // URL avatar (string, nullable)
  "follower_count": 0,                            // Số follower (int)
  "following_count": 0,                           // Số following (int)
  "heart_count": 0,                               // Số tim (int)
  "video_count": 0,                               // Số video (int)
  "bio_signature": null,                          // Chữ ký bio (string, nullable)
  "status": "active",                             // Trạng thái (string)
  "notes": "| 2FA: code",                         // Ghi chú (string)
  "proxy_id": null,                               // ID proxy (int, nullable)
  "device_id": 11,                                // ID thiết bị (int)
  "scenario_id": 11,                              // ID kịch bản (int)
  "two_factor_enabled": true,                     // Bật 2FA (boolean)
  "two_factor_backup_codes": ["code1", "code2"],  // Mã backup 2FA (array)
  "last_login_at": null,                          // Lần đăng nhập cuối (datetime, nullable)
  "last_activity_at": null,                       // Hoạt động cuối (datetime, nullable)
  "created_at": "2025-08-15T02:13:46.000000Z",    // Ngày tạo (datetime)
  "updated_at": "2025-08-15T02:14:13.000000Z"     // Ngày cập nhật (datetime)
}
```

---

## Lưu Ý Quan Trọng

### 1. **Cấu trúc Parameters**
- Tất cả parameters được truyền dưới dạng JSON string trong field `parameters`
- Cần parse JSON string thành JSONObject trước khi sử dụng

### 2. **Default Values**
- Tất cả các tham số đều có giá trị mặc định
- Nếu không truyền tham số, sẽ sử dụng giá trị mặc định

### 3. **Data Types**
- **Boolean**: `true`/`false`
- **Integer**: Số nguyên
- **String**: Chuỗi ký tự
- **Array**: Mảng JSON
- **Nullable**: Có thể là `null`

### 4. **Rate Values**
- Các giá trị rate (như `emotion_rate`, `follow_rate`) được tính theo phần trăm (0-100)
- Trong code sẽ được chia cho 100 để chuyển thành float (0.0-1.0)

### 5. **Time Values**
- Tất cả thời gian được tính bằng giây
- Delay values là khoảng thời gian chờ giữa các hành động

### 6. **List Values**
- Các danh sách có thể được truyền dưới dạng:
  - JSON Array: `["item1", "item2"]`
  - String với newline: `"item1\nitem2"`

### 7. **2FA Support**
- Hỗ trợ đầy đủ 2FA với backup codes
- Nếu `two_factor_enabled = true`, sẽ sử dụng backup code đầu tiên
- Fallback về `otp` field nếu không có backup codes

---

## Ví Dụ JSON Hoàn Chỉnh

```json
{
  "success": true,
  "tasks": [
    {
      "id": 78,
      "tiktok_account_id": 11,
      "interaction_scenario_id": 11,
      "device_id": 11,
      "task_type": "random_video_interaction",
      "parameters": "{\"account_username\":\"thao01917\",\"scenario_name\":\"kịch bản t2\",\"device_id\":11,\"created_by\":1,\"scenario_scripts\":[{\"id\":2,\"type\":\"random_video_interaction\",\"name\":\"Tương tác video ngẫu nhiên\",\"description\":null,\"order\":1,\"is_active\":true,\"delay_min\":null,\"delay_max\":null,\"parameters\":{\"name\":\"Tương tác video ngẫu nhiên\",\"description\":\"Tương tác video ngẫu nhiên\",\"suggestion_type\":\"suggest\",\"limit_mode\":\"video\",\"limit_video_from\":1,\"limit_video_to\":5,\"limit_time_from\":30,\"limit_time_to\":60,\"view_from\":3,\"view_to\":10,\"enable_follow\":false,\"follow_rate\":100,\"follow_gap_from\":1,\"follow_gap_to\":3,\"enable_favorite\":false,\"favorite_rate\":100,\"favorite_gap_from\":1,\"favorite_gap_to\":3,\"enable_repost\":false,\"repost_rate\":100,\"repost_gap_from\":1,\"repost_gap_to\":3,\"enable_emotion\":false,\"emotion_rate\":100,\"emotion_gap_from\":1,\"emotion_gap_to\":3,\"enable_comment\":false,\"comment_rate\":100,\"comment_gap_from\":1,\"comment_gap_to\":3,\"comment_contents\":[],\"content_group\":\"\"},\"success_count\":0,\"failure_count\":0,\"last_executed_at\":null,\"success_rate\":0}]}",
      "priority": "medium",
      "status": "pending",
      "result": ["Đã hoàn thành tất cả scripts"],
      "error_message": null,
      "retry_count": 0,
      "max_retries": 3,
      "scheduled_at": null,
      "started_at": null,
      "completed_at": "2025-08-15T02:15:06.000000Z",
      "created_at": "2025-08-15T02:14:20.000000Z",
      "updated_at": "2025-08-15T02:15:06.000000Z",
      "scenario": {
        "id": 11,
        "user_id": 1,
        "name": "kịch bản t2",
        "description": "ABCXYZ",
        "shuffle_actions": false,
        "run_count": false,
        "from_count": 1,
        "to_count": 5,
        "status": "active",
        "total_interactions": 0,
        "execution_count": 0,
        "last_executed_at": null,
        "settings": null,
        "created_at": "2025-08-14T14:31:56.000000Z",
        "updated_at": "2025-08-14T14:31:56.000000Z"
      },
      "account": {
        "id": 11,
        "user_id": 1,
        "username": "thao01917",
        "email": "stefanymendesloagv54129@hotmail.com",
        "phone_number": null,
        "password": "Quangbinh123@",
        "nickname": null,
        "avatar_url": null,
        "follower_count": 0,
        "following_count": 0,
        "heart_count": 0,
        "video_count": 0,
        "bio_signature": null,
        "status": "active",
        "notes": "| 2FA: voYsuW45",
        "proxy_id": null,
        "device_id": 11,
        "scenario_id": 11,
        "two_factor_enabled": true,
        "two_factor_backup_codes": ["voYsuW45"],
        "last_login_at": null,
        "last_activity_at": null,
        "created_at": "2025-08-15T02:13:46.000000Z",
        "updated_at": "2025-08-15T02:14:13.000000Z"
      }
    }
  ]
}
```

---

*Tài liệu này được tạo tự động dựa trên phân tích code trong `MainActivity.kt`*
