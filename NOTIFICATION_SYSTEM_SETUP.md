# 🔔 Task Notification System - Complete Setup Guide

## Overview

This guide provides a complete workflow for implementing the task notification system that alerts users when admins assign them tasks. The system includes popup notifications, a notification bell with unread count, and a full notifications page.

## 📋 Specification Files

The complete specification is located in `.kiro/specs/task-notification-system/`:

1. **requirements.md** - 11 user stories with detailed acceptance criteria
2. **design.md** - Technical architecture, components, and correctness properties
3. **tasks.md** - 23 implementation tasks with all tests included

## 🎯 Key Features

### For Users
- ✅ **Popup Notifications** - See new task assignments when opening the app
- ✅ **Notification Bell** - Bell icon in header with unread count badge
- ✅ **Notification Dropdown** - Quick view of recent notifications
- ✅ **Notifications Page** - Full page with filters and search
- ✅ **Real-time Updates** - Instant notifications without page refresh
- ✅ **Priority Levels** - Visual indicators for urgent, high, normal, low priority
- ✅ **Auto Mark as Read** - Notifications marked read when clicked
- ✅ **Navigation** - Click notification to go to relevant task/case

### For Admins
- ✅ **Automatic Notifications** - No manual work, notifications created automatically
- ✅ **Task Assignment Tracking** - Know when users are notified
- ✅ **Priority Calculation** - System calculates priority based on deadline

### For System
- ✅ **Database Triggers** - Automatic notification creation on task insert
- ✅ **Real-time Subscriptions** - Supabase real-time for instant delivery
- ✅ **Row Level Security** - Users only see their own notifications
- ✅ **Auto Cleanup** - Old notifications automatically expire
- ✅ **Performance Optimized** - Indexed queries, limited results

## 🏗️ Architecture

```
User Opens App
     ↓
NotificationPopupContainer fetches unread popups
     ↓
Popups display in top-right corner
     ↓
User sees notification bell with count
     ↓
User clicks notification → navigates to task → marks as read
     ↓
Real-time subscription keeps everything in sync
```

## 📦 Components

### Database Layer
- **notifications table** - Stores all notification records
- **Database functions** - 8 functions for CRUD operations
- **Trigger** - Automatically creates notifications on task insert
- **RLS Policies** - Security to ensure user isolation

### Library Layer
- **src/lib/notifications.ts** - All notification operations
- Functions for get, create, update, delete, subscribe
- Utility functions for formatting and styling

### Context Layer
- **src/contexts/NotificationContext.tsx** - Global state management
- Manages notifications array and unread count
- Handles real-time subscription lifecycle
- Provides operations to all components

### UI Components
- **NotificationBell** - Bell icon in header with dropdown
- **NotificationPopup** - Popup overlay for new notifications
- **NotificationPopupContainer** - Manages multiple popups
- **NotificationsPage** - Full page view with filters

## 🚀 Implementation Workflow

### Phase 1: Database Setup (Tasks 1-4)
1. Create notifications table with indexes
2. Create 8 database functions
3. Create trigger on tasks table
4. Enable real-time subscriptions

**Result:** Database ready to store and broadcast notifications

### Phase 2: Library & Context (Tasks 5-7)
5. Create notification management library
6. Add utility functions
7. Create NotificationContext

**Result:** Business logic and state management ready

### Phase 3: UI Components (Tasks 8-11)
8. Create NotificationBell component
9. Create NotificationPopup component
10. Create NotificationPopupContainer
11. Create NotificationsPage

**Result:** All UI components ready to display notifications

### Phase 4: Integration (Tasks 12-16)
12. Add NotificationProvider to App.tsx
13. Add NotificationBell to Header
14. Add NotificationPopupContainer to App.tsx
15. Add route for NotificationsPage
16. Export useNotifications hook

**Result:** Fully integrated notification system

### Phase 5: Testing & Polish (Tasks 17-23)
17. Test real-time delivery
18. Implement cleanup mechanism
19. Add error handling
20. Checkpoint - all tests pass
21. End-to-end testing
22. Create documentation
23. Final checkpoint

**Result:** Production-ready notification system

## 🧪 Testing Strategy

### Property-Based Tests (9 tests)
- Notification creation on task assignment
- Popup shown only once
- Unread count accuracy
- Notification read state consistency
- Priority level correctness
- User isolation
- Real-time delivery
- Notification expiration

### Unit Tests (3 test suites)
- NotificationBell component
- NotificationsPage component
- Error handling

### Integration Tests
- End-to-end notification flow
- Real-time subscription
- Multi-component interaction

## 📊 Database Schema

```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  task_id UUID,
  case_id UUID,
  assigned_by UUID,
  assigned_by_name VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  is_popup_shown BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
)
```

## 🔄 Notification Flow

### When Admin Assigns Task

```
1. Admin creates task with assigned_to user
   ↓
2. Database trigger fires on INSERT
   ↓
3. create_task_notification() function executes
   ↓
4. Notification record created with:
   - User ID and name
   - Task details
   - Case info (if applicable)
   - Priority (based on deadline)
   - Admin who assigned
   ↓
5. Real-time subscription broadcasts to user
   ↓
6. NotificationContext receives notification
   ↓
7. UI updates:
   - Bell count increments
   - Notification added to list
   - Popup appears (if user just logged in)
```

### When User Interacts

```
1. User clicks notification
   ↓
2. markAsRead() called
   ↓
3. Database updated: is_read = true, read_at = NOW()
   ↓
4. Local state updated
   ↓
5. UI updates:
   - Bell count decrements
   - Notification visual changes
   - Blue dot removed
   ↓
6. Navigation to relevant page (tasks or case)
```

## 🎨 Priority System

| Deadline | Priority | Color | Icon |
|----------|----------|-------|------|
| Today or earlier | Urgent | Red | ⚠️ Alert Triangle |
| Within 3 days | High | Orange | 🕐 Clock |
| Beyond 3 days | Normal | Blue | 🔔 Bell |
| Low priority | Low | Gray | ✓ Check Circle |

## 🔒 Security

- **RLS Policies** - Users can only access their own notifications
- **User ID Validation** - All operations validate user_id matches auth.uid()
- **Message Sanitization** - Prevent XSS attacks
- **Rate Limiting** - Prevent notification spam
- **Audit Logging** - Track notification access patterns

## ⚡ Performance

- **Indexed Queries** - Fast lookups on user_id, is_read, created_at
- **Limited Results** - Max 50 notifications per query
- **Real-time Optimization** - Debounce rapid updates
- **Auto Cleanup** - Remove old notifications (30 day expiration)
- **React.memo** - Optimize list rendering

## 🎯 Next Steps

### To Start Implementation:

1. **Review the spec files** in `.kiro/specs/task-notification-system/`
2. **Start with Task 1** - Set up database infrastructure
3. **Follow the tasks sequentially** - Each builds on the previous
4. **Run tests after each phase** - Ensure quality at each step
5. **Test end-to-end** - Verify complete workflow

### To Execute a Task:

Open `.kiro/specs/task-notification-system/tasks.md` and click "Start task" next to any task item in your IDE.

## 📚 Documentation

After implementation, you'll have:
- Database schema documentation
- API documentation for all functions
- Component usage guide
- Troubleshooting guide
- Admin guide for managing notifications

## 🎉 Expected Outcome

After completing all tasks, you will have:

✅ Automatic notifications when tasks are assigned
✅ Popup notifications on app open
✅ Notification bell with live unread count
✅ Full notifications page with filters
✅ Real-time updates without refresh
✅ Priority-based visual indicators
✅ Comprehensive test coverage
✅ Production-ready notification system

## 🆘 Support

If you encounter issues during implementation:
1. Check the design document for technical details
2. Review the requirements for acceptance criteria
3. Consult the error handling section in design.md
4. Ask for help with specific task details

---

**Ready to start?** Open the tasks.md file and begin with Task 1! 🚀
