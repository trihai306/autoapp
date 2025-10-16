# Cú pháp lưu script cho Facebook Account Management

## 📋 **Tóm tắt**

Hệ thống đã có sẵn backend API và frontend logic để lưu script cho các hành động Facebook. Tất cả các modal hành động Facebook đã được kết nối với hệ thống lưu script.

## 🔧 **Backend API đã có sẵn**

### 1. **Scenario Scripts API**
- **Route**: `/api/scenario-scripts`
- **Methods**: GET, POST, PUT, DELETE
- **Controller**: `ScenarioScriptController`
- **Service**: `ScenarioScriptService`

### 2. **Cú pháp lưu script**
```javascript
// Tạo script mới
const scriptData = {
    scenario_id: selectedScenario.id,
    order: actions.length + 1,
    script: JSON.stringify(config)
}
const result = await createScenarioScript(scriptData)

// Cập nhật script
const scriptData = { script: JSON.stringify(config) }
const result = await updateScenarioScript(action.id, scriptData)
```

## 🎯 **Các hành động Facebook đã có modal**

### 1. **Tương tác (Interaction)**
- ✅ `NewsfeedInteractionModal` - Tương tác Newsfeed
- ✅ `SpecificPostInteractionModal` - Tương tác bài viết chỉ định  
- ✅ `GroupInteractionModal` - Tương tác nhóm

### 2. **Đăng bài (Posting)**
- ✅ `PostToTimelineModal` - Đăng bài lên tường
- ✅ `GroupPostCreateModal` - Đăng bài lên nhóm
- ✅ `SpecificPostCreateModal` - Đăng bài chỉ định

## 📝 **Cú pháp config cho từng hành động**

### 1. **Newsfeed Interaction**
```javascript
const config = {
    type: 'newsfeed_interaction',
    name: form.actionName || 'Tương tác Newsfeed',
    FacebookNewsfeedInteractionWorkflow: {
        Config: {
            actions: form.actions,
            maxPosts: Number(form.maxPosts) || 0,
            likeRatio: Number(form.likeRatio) || 0,
            commentRatio: Number(form.commentRatio) || 0,
            comments: Array.from(new Set(selectedComments)),
        }
    }
}
```

### 2. **Group Interaction**
```javascript
const config = {
    type: 'group_interaction',
    name: form.actionName || 'Tương tác nhóm',
    FacebookGroupInteractionWorkflow: {
        Config: {
            groupUrls: (form.groupUrls || '').split('\n').map(s=>s.trim()).filter(Boolean),
            actions: form.actions,
            scrollDepth: Number(form.scrollDepth) || 0,
            comments: Array.from(new Set(selectedComments)),
        }
    }
}
```

### 3. **Post to Timeline**
```javascript
const config = {
    type: 'post_to_timeline',
    name: form.actionName || 'Đăng bài lên tường',
    FacebookPostWorkflow: {
        Config: {
            type,
            content: form.content || null,
            imagePaths: type === 'IMAGE' ? form.images.map(i=>i.path) : null,
            videoPath: type === 'VIDEO' ? form.video?.path || null : null,
        },
    },
}
```

### 4. **Group Post Create**
```javascript
const config = {
    type: 'group_post_create',
    name: form.actionName || 'Đăng bài lên nhóm',
    FacebookPostWorkflow: {
        Config: {
            type,
            content: form.content || null,
            groupUrl: form.groupUrl || null,
            imagePaths: type === 'IMAGE' ? form.images.map(i=>i.path) : null,
            videoPath: type === 'VIDEO' ? form.video?.path || null : null,
        },
    },
}
```

## 🔄 **Flow hoạt động**

1. **Tạo kịch bản** → `createInteractionScenario()`
2. **Chọn hành động** → Mở modal tương ứng
3. **Cấu hình hành động** → Điền form trong modal
4. **Lưu script** → `saveActionConfig()` → `createScenarioScript()`
5. **Script được lưu** → Database với JSON format

## ✅ **Trạng thái hiện tại**

- ✅ Backend API hoàn chỉnh
- ✅ Frontend logic hoàn chỉnh  
- ✅ Tất cả modal Facebook đã kết nối
- ✅ Cú pháp lưu script đã được implement
- ✅ Handler cho từng loại hành động đã có

## 🚀 **Cách sử dụng**

1. Vào **Facebook Account Management**
2. Click **"Cấu hình Tương tác"**
3. Tạo kịch bản mới
4. Thêm hành động từ danh sách
5. Cấu hình hành động trong modal
6. Script sẽ được lưu tự động

Hệ thống đã sẵn sàng để lưu script cho tất cả các hành động Facebook!
