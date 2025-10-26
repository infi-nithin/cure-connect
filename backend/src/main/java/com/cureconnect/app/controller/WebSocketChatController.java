package com.cureconnect.app.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.cureconnect.app.entity.ChatMessage;
import com.cureconnect.app.service.ChatMessageService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatMessageService chatMessageService;
    
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> messagePayload) {
        
        UUID senderId;
        UUID receiverId;
        String messageText = messagePayload.get("messageText");
        
        try {
            senderId = UUID.fromString(messagePayload.get("senderId"));
            receiverId = UUID.fromString(messagePayload.get("receiverId"));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid UUID format in chat payload: " + e.getMessage());
            return;
        }

        ChatMessage savedMessage = chatMessageService.saveMessage(senderId, receiverId, messageText);

        messagingTemplate.convertAndSendToUser(
            savedMessage.getReceiver().getId().toString(),
            "/queue/messages",
            savedMessage
        );
        
        messagingTemplate.convertAndSendToUser(
            savedMessage.getSender().getId().toString(),
            "/queue/messages",
            savedMessage
        );
    }
}