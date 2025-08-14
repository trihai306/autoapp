# TikTok Script JSON Data Schemas Documentation

This document contains all the JSON data structures used for storing script configurations in the TikTok automation system.

## Table of Contents

1. [Action List Modal](#action-list-modal)
2. [Change Bio Form](#change-bio-form)
3. [Change Name Form](#change-name-form)
4. [Create Post Form](#create-post-form)
5. [Follow Back Form](#follow-back-form)
6. [Follow By ID Form](#follow-by-id-form)
7. [Follow Suggested Form](#follow-suggested-form)
8. [Follow User Form](#follow-user-form)
9. [Friend Interaction Form](#friend-interaction-form)
10. [Keyword Video Form](#keyword-video-form)
11. [Notification Form](#notification-form)
12. [Random Live Form](#random-live-form)
13. [Specific Live Form](#specific-live-form)
14. [Specific Video Form](#specific-video-form)
15. [Update Avatar Form](#update-avatar-form)
16. [User Video Form](#user-video-form)
17. [Random Video Interaction Form](#random-video-interaction-form)
18. [Settings Modal](#settings-modal)

---

## Action List Modal

**File:** `action-list-modal.blade.php`

### Actions Array Structure
```json
{
  "type": "string",
  "name": "string",
  "description": "string", 
  "icon": "string (SVG path)"
}
```

### Available Action Types
```json
[
  {
    "type": "notification",
    "name": "Đọc thông báo",
    "description": "Tự động đọc và xử lý thông báo từ TikTok",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 17h5l-5 5v-5zM9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2z\"></path>"
  },
  {
    "type": "random_video",
    "name": "Tương tác video ngẫu nhiên",
    "description": "Tương tác với các video được đề xuất ngẫu nhiên",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15\"></path>"
  },
  {
    "type": "specific_video",
    "name": "Tương tác video chỉ định",
    "description": "Tương tác với video từ danh sách link cụ thể",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101\"></path>"
  },
  {
    "type": "keyword_video",
    "name": "Tương tác video theo từ khóa",
    "description": "Tìm kiếm và tương tác video theo từ khóa",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\"></path>"
  },
  {
    "type": "specific_live",
    "name": "Tương tác live chỉ định",
    "description": "Tương tác với livestream từ danh sách cụ thể.",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a5 5 0 017.072 0\"></path>"
  },
  {
    "type": "follow_user",
    "name": "Theo dõi người dùng",
    "description": "Tự động theo dõi người dùng được chỉ định",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z\"></path>"
  },
  {
    "type": "like_video",
    "name": "Thích video",
    "description": "Tự động thích video trong danh sách",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z\"></path>"
  },
  {
    "type": "comment_video",
    "name": "Bình luận video",
    "description": "Tự động bình luận vào video được chỉ định",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z\"></path>"
  },
  {
    "type": "share_video",
    "name": "Chia sẻ video",
    "description": "Tự động chia sẻ video được yêu thích",
    "icon": "<path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z\"></path>"
  }
]
```

---

## Change Bio Form

**File:** `change-bio-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "new_bio": "string",
  "add_emoji": "boolean",
  "max_length": "number"
}
```

### Default Values
```json
{
  "name": "Đổi tiểu sử",
  "new_bio": "",
  "add_emoji": false,
  "max_length": 80
}
```

---

## Change Name Form

**File:** `change-name-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "selection_type": "string",
  "name_type": "string"
}
```

### Default Values
```json
{
  "name": "Đổi tên",
  "selection_type": "random",
  "name_type": "vietnamese"
}
```

### Selection Type Options
- `"random"` - Ngẫu nhiên
- `"list"` - Từ danh sách  
- `"custom"` - Tùy chỉnh

### Name Type Options
- `"vietnamese"` - Theo tên Việt
- `"international"` - Theo tên Quốc Tế

---

## Create Post Form

**File:** `create-post-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "load_time_from": "number",
  "load_time_to": "number", 
  "post_by_filename": "boolean",
  "title": "string",
  "content": "string",
  "image_source": "string",
  "image_paths": "array",
  "image_urls": "array",
  "delete_used_images": "boolean",
  "auto_cut": "boolean",
  "filter_type": "string",
  "custom_filters": "string",
  "add_trending_music": "boolean"
}
```

### Default Values
```json
{
  "name": "Tạo bài viết",
  "load_time_from": 3,
  "load_time_to": 5,
  "post_by_filename": false,
  "title": "",
  "content": "",
  "image_source": "",
  "image_paths": [],
  "image_urls": [],
  "delete_used_images": false,
  "auto_cut": false,
  "filter_type": "random",
  "custom_filters": "",
  "add_trending_music": false
}
```

### Image Source Options
- `"gallery"` - Thư viện ảnh
- `"upload"` - Tải ảnh lên
- `"camera"` - Camera

### Filter Type Options
- `"random"` - Random
- `"custom"` - Custom (List Filter)

---

## Follow Back Form

**File:** `follow-back-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "count_from": "number",
  "count_to": "number",
  "gap_from": "number",
  "gap_to": "number"
}
```

### Default Values
```json
{
  "name": "Theo dõi lại",
  "count_from": 1,
  "count_to": 1,
  "gap_from": 3,
  "gap_to": 5
}
```

---

## Follow By ID Form

**File:** `follow-by-id-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "link_from": "number",
  "link_to": "number",
  "count_from": "number",
  "count_to": "number",
  "gap_from": "number",
  "gap_to": "number",
  "link_list": "string"
}
```

### Default Values
```json
{
  "name": "Theo dõi User qua Id chỉ định",
  "link_from": 1,
  "link_to": 3,
  "count_from": 1,
  "count_to": 3,
  "gap_from": 3,
  "gap_to": 5,
  "link_list": ""
}
```

---

## Follow Suggested Form

**File:** `follow-suggested-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "count_from": "number",
  "count_to": "number",
  "gap_from": "number",
  "gap_to": "number"
}
```

### Default Values
```json
{
  "name": "Theo dõi User gợi ý",
  "count_from": 1,
  "count_to": 1,
  "gap_from": 3,
  "gap_to": 5
}
```

---

## Follow User Form

**File:** `follow-user-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "follow_type": "string",
  "user_list": "string",
  "keyword_list": "string",
  "count_from": "number",
  "count_to": "number",
  "gap_from": "number",
  "gap_to": "number",
  "exit_on_fail": "boolean",
  "exit_fail_count": "number",
  "open_link_search": "boolean"
}
```

### Default Values
```json
{
  "name": "Theo dõi User",
  "follow_type": "list",
  "user_list": "",
  "keyword_list": "",
  "count_from": 1,
  "count_to": 2,
  "gap_from": 3,
  "gap_to": 5,
  "exit_on_fail": false,
  "exit_fail_count": 5,
  "open_link_search": false
}
```

### Follow Type Options
- `"list"` - Theo dõi theo danh sách
- `"keyword"` - Theo dõi theo từ khóa

---

## Friend Interaction Form

**File:** `friend-interaction-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "limit_mode": "string",
  "limit_friend_from": "number",
  "limit_friend_to": "number",
  "limit_time_from": "number",
  "limit_time_to": "number",
  "view_from": "number",
  "view_to": "number",
  "enable_favorite": "boolean",
  "favorite_rate": "number",
  "favorite_gap_from": "number",
  "favorite_gap_to": "number",
  "enable_repost": "boolean",
  "repost_rate": "number",
  "repost_gap_from": "number",
  "repost_gap_to": "number",
  "enable_emotion": "boolean",
  "emotion_rate": "number",
  "emotion_gap_from": "number",
  "emotion_gap_to": "number",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array"
}
```

### Default Values
```json
{
  "name": "Tương tác bạn bè",
  "limit_mode": "friend",
  "limit_friend_from": 1,
  "limit_friend_to": 5,
  "limit_time_from": 30,
  "limit_time_to": 60,
  "view_from": 3,
  "view_to": 10,
  "enable_favorite": false,
  "favorite_rate": 100,
  "favorite_gap_from": 1,
  "favorite_gap_to": 3,
  "enable_repost": false,
  "repost_rate": 100,
  "repost_gap_from": 1,
  "repost_gap_to": 3,
  "enable_emotion": false,
  "emotion_rate": 100,
  "emotion_gap_from": 1,
  "emotion_gap_to": 3,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": []
}
```

---

## Keyword Video Form

**File:** `keyword-video-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "keyword_list": "string",
  "limit_mode": "string",
  "limit_video_from": "number",
  "limit_video_to": "number",
  "limit_time_from": "number",
  "limit_time_to": "number",
  "view_from": "number",
  "view_to": "number",
  "enable_follow": "boolean",
  "follow_rate": "number",
  "follow_gap_from": "number",
  "follow_gap_to": "number",
  "enable_favorite": "boolean",
  "favorite_rate": "number",
  "favorite_gap_from": "number",
  "favorite_gap_to": "number",
  "enable_repost": "boolean",
  "repost_rate": "number",
  "repost_gap_from": "number",
  "repost_gap_to": "number",
  "enable_emotion": "boolean",
  "emotion_rate": "number",
  "emotion_gap_from": "number",
  "emotion_gap_to": "number",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array"
}
```

### Default Values
```json
{
  "name": "Tương tác video theo từ khóa",
  "keyword_list": "",
  "limit_mode": "video",
  "limit_video_from": 1,
  "limit_video_to": 2,
  "limit_time_from": 30,
  "limit_time_to": 30,
  "view_from": 3,
  "view_to": 5,
  "enable_follow": false,
  "follow_rate": 100,
  "follow_gap_from": 1,
  "follow_gap_to": 3,
  "enable_favorite": false,
  "favorite_rate": 100,
  "favorite_gap_from": 1,
  "favorite_gap_to": 3,
  "enable_repost": false,
  "repost_rate": 100,
  "repost_gap_from": 1,
  "repost_gap_to": 3,
  "enable_emotion": false,
  "emotion_rate": 100,
  "emotion_gap_from": 1,
  "emotion_gap_to": 3,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": []
}
```

---

## Notification Form

**File:** `notification-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "count_from": "number",
  "count_to": "number",
  "gap_from": "number",
  "gap_to": "number",
  "count_follow": "boolean",
  "follow_from": "number",
  "follow_to": "number",
  "count_say_hi": "boolean",
  "say_hi_from": "number",
  "say_hi_to": "number"
}
```

### Default Values
```json
{
  "name": "Đọc thông báo",
  "count_from": 1,
  "count_to": 2,
  "gap_from": 1,
  "gap_to": 3,
  "count_follow": false,
  "follow_from": 1,
  "follow_to": 3,
  "count_say_hi": false,
  "say_hi_from": 1,
  "say_hi_to": 3
}
```

---

## Random Live Form

**File:** `random-live-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "limit_mode": "string",
  "limit_video_from": "number",
  "limit_video_to": "number",
  "limit_time_from": "number",
  "limit_time_to": "number",
  "view_from": "number",
  "view_to": "number",
  "actions": {
    "follow": {
      "enable": "boolean",
      "rate": "number",
      "gap_from": "number",
      "gap_to": "number"
    },
    "emotion": {
      "enable": "boolean",
      "rate": "number",
      "gap_from": "number",
      "gap_to": "number"
    }
  },
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array"
}
```

### Default Values
```json
{
  "name": "Tương tác live ngẫu nhiên",
  "limit_mode": "video",
  "limit_video_from": 1,
  "limit_video_to": 2,
  "limit_time_from": 30,
  "limit_time_to": 60,
  "view_from": 3,
  "view_to": 5,
  "actions": {
    "follow": {
      "enable": false,
      "rate": 100,
      "gap_from": 1,
      "gap_to": 3
    },
    "emotion": {
      "enable": false,
      "rate": 100,
      "gap_from": 1,
      "gap_to": 3
    }
  },
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": []
}
```

---

## Specific Live Form

**File:** `specific-live-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "live_url": "string",
  "view_from": "number",
  "view_to": "number",
  "enable_continuous": "boolean",
  "continuous_gap_from": "number",
  "continuous_gap_to": "number",
  "continuous_like_enable": "boolean",
  "continuous_like_count_from": "number",
  "continuous_like_count_to": "number",
  "continuous_comment_enable": "boolean",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array",
  "actions": {
    "emotion": {
      "enable": "boolean",
      "rate": "number",
      "gap_from": "number",
      "gap_to": "number"
    },
    "follow": {
      "enable": "boolean",
      "rate": "number",
      "gap_from": "number",
      "gap_to": "number"
    }
  }
}
```

### Default Values
```json
{
  "name": "Tương tác live chỉ định",
  "live_url": "",
  "view_from": 3,
  "view_to": 5,
  "enable_continuous": false,
  "continuous_gap_from": 5,
  "continuous_gap_to": 10,
  "continuous_like_enable": false,
  "continuous_like_count_from": 10,
  "continuous_like_count_to": 20,
  "continuous_comment_enable": false,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": [],
  "actions": {
    "emotion": {
      "enable": false,
      "rate": 100,
      "gap_from": 1,
      "gap_to": 3
    },
    "follow": {
      "enable": false,
      "rate": 100,
      "gap_from": 1,
      "gap_to": 3
    }
  }
}
```

---

## Specific Video Form

**File:** `specific-video-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "link_list": "string",
  "limit_video_from": "number",
  "limit_video_to": "number",
  "view_from": "number",
  "view_to": "number",
  "enable_follow": "boolean",
  "follow_rate": "number",
  "follow_gap_from": "number",
  "follow_gap_to": "number",
  "enable_favorite": "boolean",
  "favorite_rate": "number",
  "favorite_gap_from": "number",
  "favorite_gap_to": "number",
  "enable_repost": "boolean",
  "repost_rate": "number",
  "repost_gap_from": "number",
  "repost_gap_to": "number",
  "enable_emotion": "boolean",
  "emotion_rate": "number",
  "emotion_gap_from": "number",
  "emotion_gap_to": "number",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array"
}
```

### Default Values
```json
{
  "name": "Tương tác video chỉ định",
  "link_list": "",
  "limit_video_from": 1,
  "limit_video_to": 5,
  "view_from": 3,
  "view_to": 10,
  "enable_follow": false,
  "follow_rate": 100,
  "follow_gap_from": 1,
  "follow_gap_to": 3,
  "enable_favorite": false,
  "favorite_rate": 100,
  "favorite_gap_from": 1,
  "favorite_gap_to": 3,
  "enable_repost": false,
  "repost_rate": 100,
  "repost_gap_from": 1,
  "repost_gap_to": 3,
  "enable_emotion": false,
  "emotion_rate": 100,
  "emotion_gap_from": 1,
  "emotion_gap_to": 3,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": []
}
```

---

## Update Avatar Form

**File:** `update-avatar-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "image_source": "string",
  "delete_used_images": "boolean",
  "image_paths": "array",
  "image_urls": "array"
}
```

### Default Values
```json
{
  "name": "Cập nhật Ảnh đại diện",
  "image_source": "",
  "delete_used_images": false,
  "image_paths": [],
  "image_urls": []
}
```

### Image Source Options
- `"gallery"` - Thư viện ảnh
- `"upload"` - Tải ảnh lên
- `"camera"` - Camera
- `"current"` - Ảnh hiện tại

---

## User Video Form

**File:** `user-video-form-modal.blade.php`

### Form Schema
```json
{
  "name": "string",
  "link_list": "string",
  "limit_mode": "string",
  "limit_video_from": "number",
  "limit_video_to": "number",
  "limit_time_from": "number",
  "limit_time_to": "number",
  "view_from": "number",
  "view_to": "number",
  "enable_follow": "boolean",
  "follow_rate": "number",
  "follow_gap_from": "number",
  "follow_gap_to": "number",
  "enable_favorite": "boolean",
  "favorite_rate": "number",
  "favorite_gap_from": "number",
  "favorite_gap_to": "number",
  "enable_repost": "boolean",
  "repost_rate": "number",
  "repost_gap_from": "number",
  "repost_gap_to": "number",
  "enable_emotion": "boolean",
  "emotion_rate": "number",
  "emotion_gap_from": "number",
  "emotion_gap_to": "number",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array"
}
```

### Default Values
```json
{
  "name": "Tương tác video theo User",
  "link_list": "",
  "limit_mode": "video",
  "limit_video_from": 1,
  "limit_video_to": 5,
  "limit_time_from": 30,
  "limit_time_to": 60,
  "view_from": 3,
  "view_to": 10,
  "enable_follow": false,
  "follow_rate": 100,
  "follow_gap_from": 1,
  "follow_gap_to": 3,
  "enable_favorite": false,
  "favorite_rate": 100,
  "favorite_gap_from": 1,
  "favorite_gap_to": 3,
  "enable_repost": false,
  "repost_rate": 100,
  "repost_gap_from": 1,
  "repost_gap_to": 3,
  "enable_emotion": false,
  "emotion_rate": 100,
  "emotion_gap_from": 1,
  "emotion_gap_to": 3,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": []
}
```

---

## Random Video Interaction Form

**File:** `interaction-random-video-form.blade.php`

### Form Schema
```json
{
  "name": "string",
  "suggestion_type": "string",
  "limit_mode": "string",
  "limit_video_from": "number",
  "limit_video_to": "number",
  "limit_time_from": "number",
  "limit_time_to": "number",
  "view_from": "number",
  "view_to": "number",
  "enable_follow": "boolean",
  "follow_rate": "number",
  "follow_gap_from": "number",
  "follow_gap_to": "number",
  "enable_favorite": "boolean",
  "favorite_rate": "number",
  "favorite_gap_from": "number",
  "favorite_gap_to": "number",
  "enable_repost": "boolean",
  "repost_rate": "number",
  "repost_gap_from": "number",
  "repost_gap_to": "number",
  "enable_emotion": "boolean",
  "emotion_rate": "number",
  "emotion_gap_from": "number",
  "emotion_gap_to": "number",
  "enable_comment": "boolean",
  "comment_rate": "number",
  "comment_gap_from": "number",
  "comment_gap_to": "number",
  "comment_contents": "array",
  "user_list": "string"
}
```

### Default Values
```json
{
  "name": "Tương tác video ngẫu nhiên",
  "suggestion_type": "suggest",
  "limit_mode": "video",
  "limit_video_from": 1,
  "limit_video_to": 5,
  "limit_time_from": 30,
  "limit_time_to": 60,
  "view_from": 3,
  "view_to": 10,
  "enable_follow": false,
  "follow_rate": 100,
  "follow_gap_from": 1,
  "follow_gap_to": 3,
  "enable_favorite": false,
  "favorite_rate": 100,
  "favorite_gap_from": 1,
  "favorite_gap_to": 3,
  "enable_repost": false,
  "repost_rate": 100,
  "repost_gap_from": 1,
  "repost_gap_to": 3,
  "enable_emotion": false,
  "emotion_rate": 100,
  "emotion_gap_from": 1,
  "emotion_gap_to": 3,
  "enable_comment": false,
  "comment_rate": 100,
  "comment_gap_from": 1,
  "comment_gap_to": 3,
  "comment_contents": [],
  "user_list": ""
}
```

### Suggestion Type Options
- `"suggest"` - Gợi ý
- `"following"` - Đang theo dõi

---

## Settings Modal

**File:** `settings-modal.blade.php`

### Settings Schema
```json
{
  "clearDataAfterInteract": "boolean",
  "deactivateAfterInteract": "boolean",
  "activeTimeLimit": "number",
  "actionTimeLimit": "number",
  "delayOpenFrom": "number",
  "delayOpenTo": "number",
  "delayCaptcha": "number",
  "followJobType": "string",
  "openLinkSearch": "string",
  "loginType": "string"
}
```

### Default Values
```json
{
  "clearDataAfterInteract": false,
  "deactivateAfterInteract": false,
  "activeTimeLimit": 10,
  "actionTimeLimit": 10,
  "delayOpenFrom": 3,
  "delayOpenTo": 5,
  "delayCaptcha": 5,
  "followJobType": "random",
  "openLinkSearch": "random",
  "loginType": "uid_pass"
}
```

---

## Common Data Types

### Comment Content Structure
```json
{
  "id": "number",
  "content": "string",
  "group_id": "number",
  "title_id": "number"
}
```

### Image Upload Response
```json
{
  "success": "boolean",
  "message": "string",
  "files": [
    {
      "path": "string",
      "url": "string"
    }
  ]
}
```

### Action Configuration Structure
```json
{
  "enable": "boolean",
  "rate": "number",
  "gap_from": "number", 
  "gap_to": "number"
}
```

---

## Notes

1. **Number Fields**: All number fields should be positive integers unless specified otherwise.

2. **Range Fields**: Fields with `_from` and `_to` suffixes represent ranges where `_from` should be less than or equal to `_to`.

3. **Rate Fields**: Rate fields are percentages (0-100) indicating the probability of performing an action.

4. **Gap Fields**: Gap fields represent time delays in seconds between actions.

5. **Array Fields**: Arrays like `comment_contents`, `image_paths`, and `image_urls` can be empty or contain multiple items.

6. **Boolean Fields**: All boolean fields default to `false` unless specified otherwise.

7. **String Fields**: String fields can be empty unless marked as required in validation.

8. **Event Handling**: All forms dispatch custom events when saved, following the pattern `{action-type}-saved`.

This documentation provides a complete reference for all JSON data structures used in the TikTok automation script system.
