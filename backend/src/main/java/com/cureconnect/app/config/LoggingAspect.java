package com.cureconnect.app.config;

import java.util.Arrays;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Pointcut("within(com.cureconnect.app.service..*) || within(com.cureconnect.app.controller..*)")
    public void applicationPackagePointcut() {
    }

    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String signature = joinPoint.getSignature().toShortString();
        log.info(">>>> ENTER: {}() with arguments[s] = {}", signature, Arrays.toString(joinPoint.getArgs()));

        long start = System.currentTimeMillis();
        Object result = null;

        try {
            result = joinPoint.proceed();
            return result;
        } finally {
            long duration = System.currentTimeMillis() - start;
            String resultLog = (result != null) ? result.getClass().getSimpleName() : "void/null";
            log.info("<<<< EXIT: {}() executed in {}ms, returning Type: {}", signature, duration, resultLog);
        }
    }
    
    @AfterThrowing(pointcut = "applicationPackagePointcut()", throwing = "e")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable e) {
        log.error("!!!! EXCEPTION: {}() has thrown an exception: {}", 
            joinPoint.getSignature().toShortString(), 
            e.getMessage(), 
            e
        );
    }
}