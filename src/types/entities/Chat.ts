export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdDate: string;
  isRead: boolean;
}

export interface MessagesResponse {
  messages: ChatMessage[];
}

export interface ChatOffer {
  id: string;
  price: number;
  status: string;
  type: string;
  book: {
    id: string;
    title: string;
    image: {
      id: string;
      path: string | null;
    };
    author: string | null;
    condition: string;
  };
}

export interface ChatCounterpart {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface Conversation {
  id: string;
  offer: ChatOffer;
  counterpart: ChatCounterpart;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendConversationMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendOfferMessageRequest {
  offerId: string;
  content: string;
}

export interface UnreadCountResponse {
  unreadMessages: number;
  unreadConversations: number;
}
