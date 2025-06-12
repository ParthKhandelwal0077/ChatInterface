// 🧑 Users & Phone Numbers
export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type PhoneNumber = {
  id: string;
  user_id: string;
  phone_number: string;
  is_primary: boolean;
  created_at: string;
};

// 💬 Conversations (1:1 Chats)
export type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
};

export type ConversationTag = {
  conversation_id: string;
  tag_id: string;
};

// 👥 Groups
export type Group = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  community_id: string;
  is_announcement_group: boolean;
  created_at: string;
};

export type GroupMember = {
  group_id: string;
  phone_number_id: string;
  role: 'admin' | 'member';
  can_send_messages: boolean;
  can_invite: boolean;
  is_muted: boolean;
  is_blocked: boolean;
  joined_at: string;
};

export type GroupTag = {
  group_id: string;
  tag_id: string;
};

export type GroupJoinRequest = {
  id: string;
  group_id: string;
  phone_number_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  responded_by: string | null;
  responded_at: string | null;
};

// 🌐 Communities
export type Community = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type CommunityMember = {
  community_id: string;
  phone_number_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

export type CommunityTag = {
  community_id: string;
  tag_id: string;
};

export type CommunityGroupPermission = {
  community_id: string;
  group_id: string;
  visible_to_all: boolean;
  auto_join: boolean;
  created_at: string;
};

// 🧵 Messages
export type Message = {
  id: string;
  conversation_id: string | null;
  group_id: string | null;
  community_id: string | null;
  sender_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'location';
  reply_to_message_id: string | null;
  sent_at: string;
};

export type MessageAttachment = {
  id: string;
  message_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_at: string;
};

// 🏷️ Tags
export type Tag = {
  id: string;
  name: string;
  created_at: string;
}; 