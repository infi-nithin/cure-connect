package com.cureconnect.app.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cureconnect.app.entity.User;
import com.cureconnect.app.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService{
	@Autowired
	UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
	
		Optional<User> userInfoEntity = userRepository.findByEmail(email);
		return userInfoEntity
		.map((userInfo)->new UserDetailsImpl(userInfo.getEmail(), userInfo.getPasswordHash(), userInfo.getRoles()))
		.orElseThrow(()-> new UsernameNotFoundException(email + " not found"));
	}
}
