# Firebase Realtime Database Structure

## Database Schema

```json
{
  "users": {
    "userId1": {
      "email": "john@example.com",
      "displayName": "John Doe",
      "photoURL": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "preferences": {
        "theme": {
          "mode": "light",
          "primaryColor": "#3B82F6",
          "secondaryColor": "#14B8A6",
          "accentColor": "#F97316"
        },
        "notifications": {
          "emailNotifications": true,
          "pushNotifications": true,
          "projectDeadlines": true,
          "meetingReminders": true
        }
      }
    }
  },
  "clients": {
    "clientId1": {
      "name": "Sarah Johnson",
      "email": "sarah@techcorp.com",
      "phone": "+1-555-0123",
      "company": "TechCorp Solutions",
      "category": "Web Development",
      "status": "active",
      "userId": "userId1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "clientId2": {
      "name": "Michael Chen",
      "email": "michael@innovatetech.com",
      "phone": "+1-555-0124",
      "company": "InnovateTech",
      "category": "Mobile App",
      "status": "active",
      "userId": "userId1",
      "createdAt": "2024-01-16T09:15:00.000Z",
      "updatedAt": "2024-01-16T09:15:00.000Z"
    },
    "clientId3": {
      "name": "Emily Rodriguez",
      "email": "emily@digitalstore.com",
      "phone": "+1-555-0125",
      "company": "Digital Store Inc",
      "category": "E-commerce",
      "status": "active",
      "userId": "userId1",
      "createdAt": "2024-01-17T14:20:00.000Z",
      "updatedAt": "2024-01-17T14:20:00.000Z"
    }
  },
  "projects": {
    "projectId1": {
      "title": "E-commerce Platform Redesign",
      "description": "Complete redesign of the online store with modern UI/UX, mobile optimization, and improved checkout process.",
      "clientId": "clientId3",
      "status": "in-progress",
      "priority": "high",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-03-15T00:00:00.000Z",
      "budget": 25000,
      "progress": 65,
      "userId": "userId1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T16:45:00.000Z"
    },
    "projectId2": {
      "title": "Mobile App Development",
      "description": "Native iOS and Android app for customer engagement and loyalty program management.",
      "clientId": "clientId2",
      "status": "planning",
      "priority": "medium",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-05-01T00:00:00.000Z",
      "budget": 45000,
      "progress": 15,
      "userId": "userId1",
      "createdAt": "2024-01-16T09:15:00.000Z",
      "updatedAt": "2024-01-18T11:30:00.000Z"
    },
    "projectId3": {
      "title": "Corporate Website",
      "description": "Professional corporate website with CMS, blog functionality, and contact forms.",
      "clientId": "clientId1",
      "status": "review",
      "priority": "medium",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-15T00:00:00.000Z",
      "budget": 15000,
      "progress": 90,
      "userId": "userId1",
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-19T13:20:00.000Z"
    }
  },
  "meetings": {
    "meetingId1": {
      "title": "Project Kickoff Meeting",
      "description": "Initial project discussion, requirements gathering, and timeline planning.",
      "clientId": "clientId1",
      "projectId": "projectId3",
      "date": "2024-01-25T14:00:00.000Z",
      "duration": 60,
      "meetingUrl": "https://zoom.us/j/123456789",
      "notes": "Discussed project scope, timeline, and deliverables. Client approved the initial wireframes.",
      "status": "scheduled",
      "userId": "userId1",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    "meetingId2": {
      "title": "Design Review Session",
      "description": "Review of UI/UX designs and gather feedback for the e-commerce platform.",
      "clientId": "clientId3",
      "projectId": "projectId1",
      "date": "2024-01-26T10:00:00.000Z",
      "duration": 90,
      "meetingUrl": "https://meet.google.com/abc-defg-hij",
      "notes": "Client requested changes to the color scheme and navigation structure.",
      "status": "scheduled",
      "userId": "userId1",
      "createdAt": "2024-01-21T15:45:00.000Z",
      "updatedAt": "2024-01-21T15:45:00.000Z"
    },
    "meetingId3": {
      "title": "Weekly Progress Update",
      "description": "Weekly check-in to discuss project progress and address any blockers.",
      "clientId": "clientId2",
      "projectId": "projectId2",
      "date": "2024-01-22T16:00:00.000Z",
      "duration": 30,
      "meetingUrl": null,
      "notes": "Discussed API integration challenges and revised timeline.",
      "status": "completed",
      "userId": "userId1",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-22T16:30:00.000Z"
    }
  },
  "notifications": {
    "notificationId1": {
      "userId": "userId1",
      "type": "deadline",
      "title": "Project Deadline Approaching",
      "message": "E-commerce Platform Redesign is due in 3 days",
      "relatedId": "projectId1",
      "priority": "high",
      "read": false,
      "createdAt": "2024-01-22T09:00:00.000Z"
    },
    "notificationId2": {
      "userId": "userId1",
      "type": "meeting",
      "title": "Meeting Tomorrow",
      "message": "Design Review Session is scheduled for tomorrow at 10:00 AM",
      "relatedId": "meetingId2",
      "priority": "medium",
      "read": false,
      "createdAt": "2024-01-25T08:00:00.000Z"
    }
  },
  "files": {
    "fileId1": {
      "name": "project-requirements.pdf",
      "url": "https://firebasestorage.googleapis.com/...",
      "size": 2048576,
      "type": "application/pdf",
      "relatedType": "project",
      "relatedId": "projectId1",
      "userId": "userId1",
      "uploadedAt": "2024-01-15T11:00:00.000Z"
    },
    "fileId2": {
      "name": "client-contract.pdf",
      "url": "https://firebasestorage.googleapis.com/...",
      "size": 1024768,
      "type": "application/pdf",
      "relatedType": "client",
      "relatedId": "clientId1",
      "userId": "userId1",
      "uploadedAt": "2024-01-16T14:30:00.000Z"
    }
  },
  "componentSelections": {
    "selectionId1": {
      "userId": "userId1",
      "clientId": "clientId1",
      "projectId": "projectId3",
      "selectedComponents": [
        "modern-navbar",
        "hero-section",
        "contact-form",
        "feature-cards"
      ],
      "notes": "Client prefers modern, clean design with blue color scheme",
      "createdAt": "2024-01-18T10:00:00.000Z",
      "updatedAt": "2024-01-18T10:00:00.000Z"
    }
  }
}
```

## Database Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "clients": {
      "$clientId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    },
    "projects": {
      "$projectId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    },
    "meetings": {
      "$meetingId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    },
    "notifications": {
      "$notificationId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    },
    "files": {
      "$fileId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    },
    "componentSelections": {
      "$selectionId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "data.child('userId').val() === auth.uid || (!data.exists() && newData.child('userId').val() === auth.uid)"
      }
    }
  }
}
```

## Sample Data Categories

### Client Categories
- Web Development
- Mobile App
- E-commerce
- Consulting
- UI/UX Design
- Digital Marketing
- Other

### Project Status Options
- planning
- in-progress
- review
- completed
- cancelled

### Project Priority Levels
- low
- medium
- high

### Meeting Status Options
- scheduled
- completed
- cancelled

### Notification Types
- deadline
- meeting
- payment
- info

### File Types Supported
- PDF documents
- Images (JPG, PNG, GIF)
- Documents (DOC, DOCX)
- Spreadsheets (XLS, XLSX)
- Presentations (PPT, PPTX)
- Text files (TXT, MD)

## Usage Instructions

1. **Setup Firebase Realtime Database:**
   - Go to Firebase Console
   - Create a new project or use existing
   - Enable Realtime Database
   - Set up security rules as shown above

2. **Import Sample Data:**
   - Copy the JSON structure above
   - Import it into your Firebase Realtime Database
   - Adjust user IDs to match your authentication

3. **Security Rules:**
   - Apply the security rules to ensure data privacy
   - Each user can only access their own data
   - All operations require authentication

4. **Data Relationships:**
   - Clients are linked to users via `userId`
   - Projects are linked to clients via `clientId`
   - Meetings can be linked to both clients and projects
   - Files can be attached to clients, projects, or meetings
   - Notifications are user-specific and can reference other entities