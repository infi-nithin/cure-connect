package com.cureconnect.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cureconnect.app.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findBySenderIdAndReceiverIdOrderBySentAtAsc(UUID senderId, UUID receiverId);

    List<ChatMessage> findByReceiverIdAndIsRead(UUID receiverId, boolean isRead);

    @Query("SELECT m FROM ChatMessage m " +
           "WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) " +
           "   OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id) " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findChatHistory(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);

    List<ChatMessage> findByReceiverIdAndSenderIdAndIsRead(UUID receiverId, UUID senderId, boolean isRead);

    public long countByReceiverIdAndSenderIdAndIsRead(UUID receiverId, UUID senderId, boolean b);
}
