package com.cureconnect.app.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException me) {
        Map<String, Object> responseData = new HashMap<>();
        Map<String, String> allErrors = new HashMap<>();

        me
            .getBindingResult()
            .getFieldErrors()
            .forEach((eachError) -> allErrors.put(eachError.getField(), eachError.getDefaultMessage()));

        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("status", HttpStatus.BAD_REQUEST.value());
        responseData.put("error", "Validation Failed");
        responseData.put("messages", allErrors); // Using 'messages' for the detailed field errors
        
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> responseData = createErrorResponse(
                HttpStatus.NOT_FOUND,
                "Resource Not Found",
                ex.getMessage()
        );
        return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = InvalidRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequestException(InvalidRequestException ex) {
        Map<String, Object> responseData = createErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid Request",
                ex.getMessage()
        );
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = SlotAlreadyBookedException.class)
    public ResponseEntity<Map<String, Object>> handleSlotAlreadyBookedException(SlotAlreadyBookedException ex) {
        Map<String, Object> responseData = createErrorResponse(
                HttpStatus.CONFLICT,
                "Conflict",
                ex.getMessage()
        );
        return new ResponseEntity<>(responseData, HttpStatus.CONFLICT);
    }

    private Map<String, Object> createErrorResponse(HttpStatus status, String error, String message) {
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("status", status.value());
        responseData.put("error", error);
        responseData.put("message", message);
        return responseData;
    }
}