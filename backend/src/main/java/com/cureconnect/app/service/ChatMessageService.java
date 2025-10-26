package com.cureconnect.app.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cureconnect.app.entity.ChatMessage;
import com.cureconnect.app.entity.User;
import com.cureconnect.app.exception.ResourceNotFoundException;
import com.cureconnect.app.repository.ChatMessageRepository;
import com.cureconnect.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessage saveMessage(UUID senderId, UUID receiverId, String messageText) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + receiverId));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessageText(messageText);
        message.setRead(false); // Default to unread

        return chatMessageRepository.save(message);
    }
    
    @Transactional(readOnly = true)
    public ChatMessage getMessageById(UUID id) {
        return chatMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chat message not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(UUID user1Id, UUID user2Id) {
        return chatMessageRepository.findChatHistory(user1Id, user2Id);
    }

    @Transactional(readOnly = true)
    public long getUnreadMessageCount(UUID receiverId, UUID senderId) {
        return chatMessageRepository.countByReceiverIdAndSenderIdAndIsRead(receiverId, senderId, false);
    }

    @Transactional
    public List<ChatMessage> markMessagesAsRead(UUID senderId, UUID receiverId) {

        List<ChatMessage> unreadMessages = chatMessageRepository.findByReceiverIdAndSenderIdAndIsRead(receiverId, senderId, false);
        
        if (unreadMessages.isEmpty()) {
            return List.of();
        }

        for (ChatMessage message : unreadMessages) {
            message.setRead(true);
        }

        return chatMessageRepository.saveAll(unreadMessages);
    }
    
    @Transactional
    public void deleteMessage(UUID messageId) {
        ChatMessage message = getMessageById(messageId);
        chatMessageRepository.delete(message);
    }
}